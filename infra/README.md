# BlueLoop Infrastructure Architecture (AWS Target)

## 1. Overview
This directory is designated for Infrastructure-as-Code (IaC) definitions and cloud deployment configurations for BlueLoop on Amazon Web Services (AWS).

> **STATUS NOTE:**
> **No live AWS resources have been provisioned or deployed during this repository initialisation stage.**
> The definitions below document the target architecture planned for subsequent implementation stages.

## 2. Target AWS Services & Architecture Blueprint

```
                      +----------------------------------------+
                      |       Amazon CloudFront (CDN)          |
                      |  - Edge distribution for React SPA     |
                      |  - TLS termination & custom domain     |
                      +-------------------+--------------------+
                                          |
                                          v
                      +----------------------------------------+
                      |            Amazon S3 Bucket            |
                      |  - Static frontend asset hosting       |
                      +----------------------------------------+

                      +----------------------------------------+
                      |         Amazon API Gateway             |
                      |  - REST API endpoint routing           |
                      |  - Request throttling & validation     |
                      |  - Cognito Authorizer integration      |
                      +-------------------+--------------------+
                                          |
                                          v
                      +----------------------------------------+
                      |           AWS Lambda (Python)          |
                      |  - FastAPI execution via Mangum adapter|
                      |  - Deterministic allocation engine     |
                      |  - Quality verification pipeline       |
                      +---------+-------------------+----------+
                                |                   |
               +----------------v-----+    +--------v----------------+
               |   Amazon DynamoDB    |    |     Amazon S3 Bucket    |
               | - Single-table design|    | - Supplier water test   |
               | - Fast key-value lookups  |   certificates & lab    |
               | - ACID transactions  |    |   analysis documents    |
               +----------------------+    +-------------------------+
                                |
               +----------------v-----+
               |   Amazon EventBridge |
               | - Scheduled checks   |
               | - Expiry alerts      |
               +----------------------+
```

### Core Services
1. **Amazon CloudFront**: Global content delivery network serving the React single-page application.
2. **Amazon S3**:
   - `blueloop-web-frontend`: Hosting built frontend static files.
   - `blueloop-quality-docs`: Secure storage for supplier lab test certificates and water quality validation documents.
3. **Amazon API Gateway**: HTTP/REST gateway providing secure endpoints, rate limiting, and CORS handling.
4. **AWS Lambda**: Serverless compute running containerized or packaged Python 3.11 FastAPI via the Mangum ASGI handler.
5. **Amazon DynamoDB**: Low-latency NoSQL database for suppliers, buyers, demand requests, allocations, and delivery states.
6. **Amazon Cognito**: User identity management, multi-tenant role-based access control (Buyers, Suppliers, Admins).
7. **Amazon EventBridge**: Event bus handling periodic quality re-certification triggers and delivery batch deadlines.
8. **Amazon CloudWatch**: Centralised logging, structured metric collection, and operational alarms.

## 3. Deployment Strategy
Future deployment steps will utilize standard AWS Infrastructure-as-Code (IaC) templates (AWS SAM / CDK / Terraform) to ensure repeatable, automated infrastructure setup.
