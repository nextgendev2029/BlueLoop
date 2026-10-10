# BlueLoop Data Model Specification

## 1. Domain Entities Overview
BlueLoop manages six core domain entities to support water reuse intelligence, deterministic allocation, and impact accounting.

```
+------------------+       1:N       +----------------------+
|     Supplier     | --------------< |     WaterListing     |
+------------------+                 +----------------------+
                                                |
                                                | Evaluated against
                                                v
+------------------+       1:N       +----------------------+
|      Buyer       | --------------< |    DemandRequest     |
+------------------+                 +----------------------+
                                                |
                                                v
                                     +----------------------+
                                     |  Allocation Solution |
                                     +----------------------+
                                                |
                                                v
                                     +----------------------+
                                     |    Delivery Batch    |
                                     +----------------------+
                                                |
                                                v
                                     +----------------------+
                                     |    Impact Ledger     |
                                     +----------------------+
```

---

## 2. Entity Schemas

### 2.1 Supplier
Represents an industrial facility, commercial complex, or municipal wastewater treatment plant producing treated effluent for reuse.
- `id`: UUID (Primary identifier)
- `name`: String (Facility name)
- `organization_type`: Enum (`INDUSTRIAL_PARK`, `MANUFACTURING_PLANT`, `MUNICIPAL_STP`, `DATA_CENTER`)
- `latitude`: Float (Decimal degrees)
- `longitude`: Float (Decimal degrees)
- `address`: String (Physical facility address)
- `contact_email`: String
- `accreditations`: List[String] (e.g., ISO 14001, CPCB Zero Liquid Discharge)
- `created_at`: ISO 8601 Timestamp

### 2.2 WaterListing
Represents an active or recurring batch of treated water available for reuse.
- `id`: UUID
- `supplier_id`: UUID (Foreign key referencing Supplier)
- `listing_name`: String (e.g., "Tertiary Treated RO Permeate Batch A")
- `available_volume_kl_per_day`: Float (Available daily capacity in kilo-litres)
- `available_from`: Date
- `available_until`: Date
- `base_price_per_kl`: Float (Ex-works price per kL in local currency)
- **Water Quality Parameters**:
  - `ph`: Float (e.g., 7.2)
  - `tds_mg_l`: Float (Total Dissolved Solids, mg/L)
  - `cod_mg_l`: Float (Chemical Oxygen Demand, mg/L)
  - `bod_mg_l`: Float (Biochemical Oxygen Demand, mg/L)
  - `tss_mg_l`: Float (Total Suspended Solids, mg/L)
  - `turbidity_ntu`: Float (Nephelometric Turbidity Units)
  - `heavy_metals_pass`: Boolean (Confirmed below permissible environmental discharge limits)
- `lab_test_report_s3_key`: Optional[String] (S3 object key to verified laboratory test report)
- `status`: Enum (`ACTIVE`, `COMMITTED`, `EXPIRED`, `SUSPENDED`)

### 2.3 DemandRequest
Represents a water consumer's volumetric and quality specifications for non-potable or process water.
- `id`: UUID
- `buyer_id`: UUID
- `facility_name`: String
- `application_type`: Enum (`COOLING_TOWER`, `BOILER_FEED`, `INDUSTRIAL_PROCESS`, `CONSTRUCTION`, `LANDSCAPE_IRRIGATION`, `TOILET_FLUSHING`)
- `latitude`: Float
- `longitude`: Float
- `required_volume_kl_per_day`: Float
- `delivery_mode`: Enum (`PIPELINE`, `DEDICATED_TANKER`, `ANY`)
- **Maximum Acceptable Quality Thresholds**:
  - `min_ph`: Float (e.g., 6.5)
  - `max_ph`: Float (e.g., 8.5)
  - `max_tds_mg_l`: Float
  - `max_cod_mg_l`: Float
  - `max_bod_mg_l`: Float
  - `max_tss_mg_l`: Float
  - `max_turbidity_ntu`: Float
- `max_acceptable_price_per_kl`: Float
- `status`: Enum (`OPEN`, `ALLOCATED`, `PARTIALLY_ALLOCATED`, `CANCELLED`)

### 2.4 Allocation
Represents the deterministic matching decision pairing eligible water listings with demand requests.
- `id`: UUID
- `run_id`: UUID (Batch solver execution identifier)
- `listing_id`: UUID (Supplier listing)
- `demand_id`: UUID (Buyer demand)
- `allocated_volume_kl_per_day`: Float
- `transport_distance_km`: Float
- `estimated_transport_cost_per_kl`: Float
- `delivered_cost_per_kl`: Float (Base price + transport cost)
- `freshwater_displacement_kl_per_day`: Float (Direct displacement ratio)
- `compatibility_audit`: Object
  - `parameter_margins`: Dictionary mapping each tested parameter to difference from maximum tolerance
  - `passed_all_thresholds`: Boolean
- `status`: Enum (`PROPOSED`, `ACCEPTED_BY_PARTIES`, `REJECTED`, `FULFILLED`)

### 2.5 Delivery
Represents an individual physical transfer batch scheduled against an accepted allocation.
- `id`: UUID
- `allocation_id`: UUID
- `scheduled_date`: Date
- `volume_dispatched_kl`: Float
- `volume_received_kl`: Float
- `transport_method`: Enum (`TANKER`, `PIPELINE`)
- `status`: Enum (`SCHEDULED`, `DISPATCHED`, `IN_TRANSIT`, `DELIVERED`, `ACCEPTED`)
- `quality_verification_at_receipt`: Optional[Object]

### 2.6 ImpactRecord
Immutable ledger entry created upon verified delivery acceptance.
- `id`: UUID
- `delivery_id`: UUID
- `verified_freshwater_saved_kl`: Float
- `cost_savings_amount`: Float (Calculated against standard municipal virgin freshwater tariff)
- `recorded_at`: ISO 8601 Timestamp

---

## 3. Planned Amazon DynamoDB Single-Table Design

| Partition Key (PK) | Sort Key (SK) | Entity Type | Attributes & GSIs |
| :--- | :--- | :--- | :--- |
| `SUPPLIER#<id>` | `METADATA` | Supplier | Name, Location, Accreditations |
| `SUPPLIER#<id>` | `LISTING#<listing_id>` | WaterListing | Volume, Quality parameters, Price |
| `BUYER#<id>` | `METADATA` | Buyer | Company, Contact, Location |
| `BUYER#<id>` | `DEMAND#<demand_id>` | DemandRequest | Volume required, Quality thresholds |
| `ALLOCATION#<id>` | `RUN#<run_id>` | Allocation | Matched volumes, Cost metrics, Explanations |
| `DELIVERY#<id>` | `METADATA` | Delivery | Status, Timestamps, Quantities |
| `IMPACT#<year_month>` | `ENTRY#<delivery_id>` | ImpactRecord | Displaced freshwater kL, Cost delta |

---

## 4. Status
**Initialisation Phase:** Data structures are codified in specification format. Pydantic request/response schemas will be introduced alongside backend domain services in subsequent development stages.
