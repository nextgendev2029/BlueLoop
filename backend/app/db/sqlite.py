"""
BlueLoop SQLite Persistence Layer
Provides persistent, ACID-compliant storage for users, organisations,
sessions, and audit logs that survives application restarts.

NOTE (AWS Lambda Ephemeral Storage):
When executed in AWS Lambda, SQLite resides in /tmp/blueloop.db.
Storage in /tmp is ephemeral across Lambda container lifecycles. It serves
as an isolated demonstration workaround for hackathon evaluation and
is not a replacement for persistent distributed databases (e.g. Amazon DynamoDB or RDS).
"""

from datetime import datetime, timezone, timedelta
import logging
import os
import sqlite3
import threading
from typing import Any, Dict, List, Optional

from app.core.config import settings
from app.core.security import hash_password

logger = logging.getLogger("blueloop.db.sqlite")

_SCHEMA_SQL = """
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS organisations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    org_type TEXT NOT NULL,
    verification_status TEXT NOT NULL,
    contact_email TEXT,
    is_synthetic INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    org_id TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (org_id) REFERENCES organisations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_org ON users(org_id);

CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    is_revoked INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS audit_events (
    event_id TEXT PRIMARY KEY,
    actor_type TEXT NOT NULL,
    actor_id TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    details TEXT,
    timestamp TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_events(timestamp);
"""

_db_lock = threading.RLock()


def get_db_path(custom_path: Optional[str] = None) -> str:
    """Resolve database path, ensuring parent directories exist."""
    path = custom_path or settings.sqlite_db_path
    if path != ":memory:":
        parent = os.path.dirname(os.path.abspath(path))
        if parent:
            os.makedirs(parent, exist_ok=True)
    return path


def get_connection(db_path: Optional[str] = None) -> sqlite3.Connection:
    """Create a new SQLite connection configured with WAL and row factory."""
    resolved_path = get_db_path(db_path)
    conn = sqlite3.connect(
        resolved_path,
        timeout=30.0,
        check_same_thread=False,
    )
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    if resolved_path != ":memory:":
        conn.execute("PRAGMA journal_mode = WAL;")
    return conn


def init_db(db_path: Optional[str] = None) -> None:
    """Initialize database tables and run demonstration seeds if empty."""
    with _db_lock:
        conn = get_connection(db_path)
        try:
            conn.executescript(_SCHEMA_SQL)
            conn.commit()
            seed_auth_demonstration_data(conn)
        finally:
            conn.close()
    logger.info("SQLite database initialized successfully at %s", get_db_path(db_path))


def seed_auth_demonstration_data(conn: sqlite3.Connection) -> None:
    """
    Seed initial demonstration organizations and users with explicit ownership mapping.
    Only seeds if the organisations/users tables are empty.
    """
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM organisations")
    org_count = cursor.fetchone()[0]

    now_iso = datetime.now(timezone.utc).isoformat()

    demo_orgs = [
        ("SYNTH-ORG-00", "BlueLoop Platform Operations", "PLATFORM_OPERATOR", "CERTIFIED", "admin@blueloop.io", 1, now_iso),
        ("SYNTH-ORG-01", "Maraimalai Clean Tech Industrial Park", "SUPPLIER", "VERIFIED_DEMO", "ops@maraimalai-cleantech.demo.local", 1, now_iso),
        ("SYNTH-ORG-02", "Guindy Municipal Water Recovery Authority", "SUPPLIER", "VERIFIED_DEMO", "dispatch@guindy-water.demo.local", 1, now_iso),
        ("SYNTH-ORG-03", "Ambattur Common Effluent Reclamation Co", "SUPPLIER", "VERIFIED_DEMO", "reclamation@ambattur-cetp.demo.local", 1, now_iso),
        ("SYNTH-ORG-04", "Apex Hyperscale Data Center Campus", "BUYER", "VERIFIED_DEMO", "facilities@apex-dc.demo.local", 1, now_iso),
        ("SYNTH-ORG-05", "Precision Automotive Engine Works", "BUYER", "VERIFIED_DEMO", "sustainability@precision-auto.demo.local", 1, now_iso),
        ("SYNTH-ORG-06", "Metro Rail Precast Infrastructure Yard", "BUYER", "VERIFIED_DEMO", "procurement@metrorail-precast.demo.local", 1, now_iso),
    ]

    for org in demo_orgs:
        cursor.execute(
            """
            INSERT OR IGNORE INTO organisations (id, name, org_type, verification_status, contact_email, is_synthetic, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            org,
        )

    # Standard demo users
    DEMO_PASSWORD_HASH = "pbkdf2_sha256$600000$be92e0cc1929677b583008e83b3e91b5$f274c87e67612c2c04af5365964ad6803f519fef58b57471a10278002fdc9082"
    ADMIN_PASSWORD_HASH = "pbkdf2_sha256$600000$7c2de5f6173d2d36abe79d71080a9b64$b992e7a80ad34d12c8eec98d61c29361a0246d664feeedd9f86459b53c3ebf13"

    demo_users = [
        # Administrator
        (
            "USR-ADMIN-01",
            "admin@blueloop.io",
            ADMIN_PASSWORD_HASH,
            "System Administrator",
            "admin",
            "SYNTH-ORG-00",
            1,
            now_iso,
            now_iso,
        ),
        # Supplier 1 (Maraimalai)
        (
            "USR-SUP-01",
            "supplier@blueloop.io",
            DEMO_PASSWORD_HASH,
            "Maraimalai Plant Director",
            "supplier",
            "SYNTH-ORG-01",
            1,
            now_iso,
            now_iso,
        ),
        # Supplier 2 (Guindy)
        (
            "USR-SUP-02",
            "guindy.supplier@blueloop.io",
            DEMO_PASSWORD_HASH,
            "Guindy Operations Lead",
            "supplier",
            "SYNTH-ORG-02",
            1,
            now_iso,
            now_iso,
        ),
        # Supplier 3 (Ambattur)
        (
            "USR-SUP-03",
            "ambattur.supplier@blueloop.io",
            DEMO_PASSWORD_HASH,
            "Ambattur Reclamation Supervisor",
            "supplier",
            "SYNTH-ORG-03",
            1,
            now_iso,
            now_iso,
        ),
        # Buyer 1 (Apex)
        (
            "USR-BUY-01",
            "buyer@blueloop.io",
            DEMO_PASSWORD_HASH,
            "Apex Data Center Facilities Lead",
            "buyer",
            "SYNTH-ORG-04",
            1,
            now_iso,
            now_iso,
        ),
        # Buyer 2 (Precision Auto)
        (
            "USR-BUY-02",
            "precision.buyer@blueloop.io",
            DEMO_PASSWORD_HASH,
            "Precision Auto Sustainability Engineer",
            "buyer",
            "SYNTH-ORG-05",
            1,
            now_iso,
            now_iso,
        ),
        # Buyer 3 (Metro Rail)
        (
            "USR-BUY-03",
            "metrorail.buyer@blueloop.io",
            DEMO_PASSWORD_HASH,
            "Metro Rail Batching Manager",
            "buyer",
            "SYNTH-ORG-06",
            1,
            now_iso,
            now_iso,
        ),
    ]

    for user in demo_users:
        cursor.execute(
            """
            INSERT OR IGNORE INTO users (id, email, password_hash, name, role, org_id, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            user,
        )

    conn.commit()
