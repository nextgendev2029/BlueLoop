# BlueLoop Data Directory

## 1. Overview
The `data/` directory is reserved for seed data, synthetic fixtures, test datasets, and water quality standard benchmark definitions used during local development and testing of the BlueLoop platform.

## 2. Policy on Synthetic Sample Data
> **MANDATORY POLICY:**
> All initial supplier records, quality lab test reports, commercial quotations, delivery logs, and environmental savings figures in this repository are **explicitly synthetic sample data**.
> 
> Under no circumstances must synthetic records be presented or represented as verified real-world industrial entities, certified laboratory results, legally binding procurement contracts, or verified municipal water metrics.

## 3. Directory Layout (Planned)
As development progresses across subsequent stages, this folder will contain:
- `seeds/`: Initial baseline dataset seeds for local development.
- `fixtures/`: Deterministic test fixtures for water quality parameters (pH, TDS, COD, BOD, Turbidity, Heavy Metals) and constraint solver validation.
- `standards/`: Codified industrial water reuse quality standards (e.g., CPCB/EPA reuse categories for cooling towers, boiler feed, non-potable flushing, landscape irrigation).

## 4. Current Status
**Initialisation Phase:** No mock or simulated business calculations are included at this stage to prevent premature coupling or accidental misrepresentation before the core intelligence engine is codified.
