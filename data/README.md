# BlueLoop Synthetic Demonstration Data

## 1. Overview & Data Provenance
This directory documents the synthetic demonstration fixtures established for BlueLoop. The active dataset is codified in `backend/app/core/seeds.py` and seeded automatically when `USE_SYNTHETIC_DATA=true`.

> **MANDATORY POLICY ON SYNTHETIC SAMPLE DATA:**
> All supplier facilities, enterprise identities, laboratory test certificates, volumetric capacities, and quality measurements in this repository are **explicitly synthetic demonstration fixtures**.
> 
> Under no circumstances must these records be represented as verified real-world industrial entities, certified laboratory results, legally binding procurement contracts, or verified municipal water metrics.

---

## 2. Seeded Fixture Inventory (Stage 2)

### A. Organisations (`SYNTH-ORG-*`)
1. `SYNTH-ORG-01`: **Maraimalai Clean Tech Industrial Park** (Supplier)
2. `SYNTH-ORG-02`: **Guindy Municipal Water Recovery Authority** (Supplier)
3. `SYNTH-ORG-03`: **Ambattur Common Effluent Reclamation Co** (Supplier)
4. `SYNTH-ORG-04`: **Apex Hyperscale Data Center Campus** (Buyer)
5. `SYNTH-ORG-05`: **Precision Automotive Engine Works** (Buyer)
6. `SYNTH-ORG-06`: **Metro Rail Precast Infrastructure Yard** (Buyer)

### B. Treatment Facilities (`SYNTH-FAC-*`)
1. `SYNTH-FAC-01`: **Maraimalai CETP Sector A** - Maraimalai Nagar, Tamil Nadu (CETP)
2. `SYNTH-FAC-02`: **Guindy Tertiary STP** - Chennai, Tamil Nadu (Municipal Tertiary)
3. `SYNTH-FAC-03`: **Ambattur Effluent Polishing Facility** - Ambattur, Tamil Nadu (Industrial STP)

### C. Supply Listings (`SYNTH-LIST-*`)
1. `SYNTH-LIST-01`: **Tertiary Polished Stream 01** (3,500 kL/day, $0.78/kL, pH 7.35, TDS 980 mg/L, COD 38 mg/L, BOD 8.5 mg/L, Turbidity 1.4 NTU). Eligible for cooling towers.
2. `SYNTH-LIST-02`: **RO Permeate Ultrapure Batch A** (4,200 kL/day, $1.15/kL, pH 6.90, TDS 280 mg/L, COD 12 mg/L, BOD 3.0 mg/L, Turbidity 0.4 NTU). Ultra-high purity; eligible for boiler feed.
3. `SYNTH-LIST-03`: **Secondary Clarified Stream B** (1,800 kL/day, $0.55/kL, pH 7.80, TDS 2200 mg/L, COD 110 mg/L, BOD 28 mg/L, Turbidity 6.5 NTU). Ineligible for cooling towers, eligible for precast construction.
4. `SYNTH-LIST-04`: **Seasonal Overflow Batch C** (1,200 kL/day, $0.40/kL, measurements: `None`). Demonstrates the handling of uncharacterised batches with missing quality evidence.

### D. Buyer Demand Requests (`SYNTH-DEM-*`)
1. `SYNTH-DEM-01`: **Apex Data Center Evaporative Cooling** (3,000 kL/day, max TDS 1,200 mg/L, max COD 45 mg/L). Strict cooling tower threshold.
2. `SYNTH-DEM-02`: **Metro Rail Precast Casting Yard** (1,500 kL/day, max TDS 2,500 mg/L, max COD 150 mg/L). Relaxed industrial construction threshold.
3. `SYNTH-DEM-03`: **Precision Automotive Boiler Feed** (2,000 kL/day, max TDS 350 mg/L, max COD 20 mg/L). Stringent high-pressure boiler feed threshold.

---

## 3. Data Integrity & Missing Values Rule
- Missing chemical or physical measurements in `WaterQualityMeasurements` are represented strictly as `None` (`UNKNOWN`).
- The deterministic evaluation engine will never assume zero or passing status for missing measurements.
