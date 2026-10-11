# BlueLoop: Hackathon Demonstration Runbook

**Product**: BlueLoop (Industrial Water Reuse Intelligence Platform)  
**Target Audience**: Hackathon Judges, Environmental Evaluators, Technical Reviewers  
**Target Duration**: 3 to 4 Minutes  
**Mode**: Deterministic Synthetic Demonstration Mode (`synthetic_data_mode: true`)  

---

## 1. Pre-Demo Checklist (60 Seconds Before Demo)

1. **Verify Backend Status**:
   - Run `curl http://localhost:8000/api/v1/health`
   - Expect: `{"status":"ok","synthetic_data_mode":true}`
2. **Verify Frontend Status**:
   - Confirm browser tab is loaded at `http://localhost:5173/`
   - Ensure you are in a clean incognito or signed-out browser window (so you land on `/`)
3. **Display Configuration**:
   - Recommended resolution: 1440x900 or 1920x1080 at 100% zoom
4. **Fallback Hotkey**:
   - If a browser tab hangs, refresh the page or click "Sign Out" in the sidebar to reset session state cleanly.

---

## 2. Timed 10-Step Demonstration Sequence

### Step 1: The Industrial Water Paradox (Public Landing Page)
- **Actor / Profile**: Unauthenticated Visitor
- **URL**: `http://localhost:5173/`
- **Click Order**: Start at the top of the landing page. Point to the headline: *"Give industrial water another useful life."*
- **Suggested Narration**:
  > *"Every day, industrial treatment plants discharge thousands of kilolitres of high-grade treated water into local waterways. Meanwhile, nearby data centers, factories, and cooling plants draw millions of litres of scarce municipal potable water or deplete groundwater tables. This is the industrial water paradox. Reuse does not happen automatically because buyers fear equipment corrosion, scaling, and supply reliability."*
- **Expected Visible Outcome**:
  - Full-background photographic water treatment landscape with subtle Three.js blue flow streams, telemetry beacon pulses, and soft rising vapor.
  - High-contrast editorial display headline and metrics pill.

### Step 2: Core Technological Architecture (How It Works & Interface Preview)
- **Click Order**: Scroll down past the Problem Section to "How BlueLoop Powers Industrial Water Circularity" and the "Platform Interface Preview".
- **Suggested Narration**:
  > *"BlueLoop replaces ad-hoc guesswork with deterministic engineering logic: fail-closed chemical screening, constrained least-cost allocation optimization, and auditable custody tracking across regional industrial clusters."*
- **Expected Visible Outcome**:
  - 4-step workflow cards showing chemical limits (pH, TDS, COD, BOD) and Haversine transport tariffs.
  - Interactive tabs switching between Solver Output, Gatekeeper check, and Custody tracking.

### Step 3: Enter the Buyer Demo Workspace
- **Click Order**: Click "Explore Demo" in the top navigation bar, or scroll to the CTA and click "Launch Live Console". This navigates to `/login`.
- **Action**: In the "Quick Demo Access" box, click the **Buyer** button (`Apex Centers`).
- **Suggested Narration**:
  > *"Let us sign in as an industrial water consumer: the facility engineering team at Apex Hyperscale Data Center Campus."*
- **Expected Visible Outcome**:
  - Instant 1-click authentication into `/app/dashboard`.
  - Sidebar displays tenant organisation "Apex Hyperscale Data Center Campus" with green `BUYER` badge.
  - Dashboard loads regional supply/demand balance metrics (32,000 kL available, 45,500 kL demand).
  - BlueLoop logo in sidebar links to `/app/dashboard` (not returning to public marketing).

### Step 4: Demand Tolerances & Triggering the Allocation Solver
- **Click Order**: Click **Demands** in the sidebar, inspect the active demand `SYNTH-DEM-01`, then click **Allocations**.
- **Action**: On the Allocations page, click **Run Optimization Solver**.
- **Suggested Narration**:
  > *"Here, Apex has published intake requirements for an evaporative cooling loop: 400 kL/day, requiring TDS under 1,000 mg/L and pH between 6.5 and 8.5. When we trigger the allocation solver, our greedy constrained optimizer evaluates candidate treated-effluent streams across the regional cluster."*
- **Expected Visible Outcome**:
  - Instant deterministic solver response.
  - Shows eligible proposed volume, transport distance, unit water cost (₹24.00/kL), logistics tariff, and total delivered cost (₹39.54/kL).

### Step 5: Explainable Rejection & Fail-Closed Gatekeeper
- **Click Order**: On the Allocations results card, show the candidate matching breakdown and click into candidate traces.
- **Suggested Narration**:
  > *"Notice the explainability: Candidate stream SYNTH-LIST-01 matches all 7 physical and chemical parameters, passing the gatekeeper. However, candidate SYNTH-LIST-02 is explicitly rejected with reason code: 'Measured TDS (1,850 mg/L) exceeds buyer intake tolerance limit (1,000 mg/L)'. Crucially, if a laboratory report is missing a heavy metals test, the engine evaluates to UNKNOWN and fails closed. Compliance is never assumed."*
- **Expected Visible Outcome**:
  - Parameter table with green PASS chips for passing values and red FAIL chips with explicit mathematical variance for violations.
  - Disclaimer banner: *"Advisory screening only. Does not replace accredited laboratory verification."*

### Step 6: Enter the Supplier Workspace (Open Market Discovery)
- **Click Order**: Click **Sign Out** in the sidebar footer. On `/login`, click the **Supplier** button (`Maraimalai Tech`).
- **Action**: Click **Suppliers** in the sidebar, then click **Demand Requests**.
- **Suggested Narration**:
  > *"Now we switch perspectives to an effluent producer: the Maraimalai Clean Tech Industrial Park. Suppliers can manage their available batches and explore open buyer demand requests across the cluster. However, under strict tenant isolation, suppliers cannot see private closed demands, mutate buyer specifications, or access competitor listings."*
- **Expected Visible Outcome**:
  - Workspace displays supplier role badge and facility listings.
  - Demand discovery table displays regional open demands filtered to active market opportunities.

### Step 7: Enter the Platform Administrator Workspace
- **Click Order**: Click **Sign Out**, then click the **Admin** button (`Platform Ops`).
- **Action**: Navigate to **Settings** and view user administration.
- **Suggested Narration**:
  > *"As a Platform Administrator, BlueLoop operations can oversee all regional transfers, verify tenancy isolation, inspect registered facility credentials, and monitor system health."*
- **Expected Visible Outcome**:
  - Admin role badge in purple.
  - Tenant and user directory displaying all 7 registered accounts across buyer, supplier, and platform roles.

### Step 8: The 4-Stage Impact Ledger Progression
- **Click Order**: Click **Sign Out** to return to public context, then navigate to the **Impact Ledger** section on the landing page (or click **Impact Ledger** in the navbar).
- **Action**: Slowly scroll through the Impact Ledger section. Observe Stage 01, Stage 02, Stage 03, and Stage 04 transitions.
- **Suggested Narration**:
  > *"To ensure corporate sustainability declarations withstand rigorous third-party audits, BlueLoop introduces a 4-Stage Provenance Ledger. As we scroll:
  > - Stage 01 Potential: Modeled algorithmic matching.
  > - Stage 02 Agreed: Bilateral contract commitments.
  > - Stage 03 Delivered: Calibrated dual-meter intake flow records.
  > - Stage 04 Certified: Independent mass-balance environmental audit reports."*
- **Expected Visible Outcome**:
  - Left navigation rail stays pinned below navbar with continuous progress scrub bar.
  - Exactly one stage card is visible at a time on the right (never 4 stacked duplicate cards).
  - Reverse scrolling smoothly transitions back from Stage 04 to Stage 01.

### Step 9: Honest ESG Accounting (Anti-Greenwashing Protocol)
- **Click Order**: Point to the "Synthetic Ledger" badge and the displacement tier definitions on Stage 04.
- **Suggested Narration**:
  > *"Notice the key distinction: BlueLoop never counts proposed or agreed volumes as delivered freshwater displacement. Modeled savings remain in Tier 1 until physical meter telemetry confirms dock delivery in Tier 3. Independent ISO 14046 certification is required for Tier 4. This eliminates greenwashing and produces audit-ready CSRD and GRI data."*
- **Expected Visible Outcome**:
  - Prominent disclosure: *"Navigation controls visualize ledger progression; only cryptographically signed meter logs constitute audit verification."*

### Step 10: Summary & Production Readiness
- **Suggested Narration**:
  > *"In summary, BlueLoop transforms industrial wastewater from a disposal cost into a verified, circular resource. Built with FastAPI and React 18 TypeScript, verified across 139 automated tests, and pre-deployment packaged with AWS SAM serverless infrastructure, BlueLoop is ready to close the loop on industrial water."*

---

## 3. Demo Failure Recovery & Fallback Plans

| Failure Scenario | Immediate Remedy | Fallback Script Narration |
| :--- | :--- | :--- |
| **Accidentally clicked a link that navigated away** | Click the browser back button or click the BlueLoop logo in the sidebar | *"Let us return directly to our live operational dashboard."* |
| **Backend server disconnected during demo** | Restart backend in terminal: `cd backend && uvicorn app.main:app --port 8000` (<2 seconds startup) | *"The frontend gracefully displays our offline retry state, reconnecting to the security core in real time."* |
| **Browser stuck on cached session** | Open `/login` directly in URL bar and click the desired 1-click role button | *"Our one-click sandbox profiles instantly re-establish verified session state."* |
| **Audience asks if real water is being delivered** | Reiterate the synthetic demonstration policy | *"All current data consists of reproducible synthetic demonstration fixtures. Our algorithms and gatekeeping logic are production-grade deterministic rules ready for live telemetry."* |
