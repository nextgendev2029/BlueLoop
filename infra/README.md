# BlueLoop Infrastructure & Deployment Guide (AWS Serverless)

## 1. Overview
This directory contains the Infrastructure-as-Code (IaC) definitions and automated deployment configuration for BlueLoop on Amazon Web Services (AWS).

> **DEPLOYMENT STATUS: NOT DEPLOYED (Artifacts Prepared & Validated)**  
> In accordance with Stage B resource safety protocols, live billable AWS resources have **not** been provisioned. All deployment artifacts, AWS SAM templates, and build routines have been packaged, linted, and verified via `./scripts/deploy.sh --dry-run`.

---

## 2. Serverless Target Architecture

```
                                  [ Public Internet ]
                                           │
                                  HTTPS (Port 443)
                                           │
                                           ▼
                      ┌────────────────────────────────────────┐
                      │        Amazon CloudFront CDN           │
                      │  - Global Edge Caching                 │
                      │  - Origin Access Control (OAC)         │
                      │  - Custom Error Response:              │
                      │    403/404 -> /index.html (SPA Router) │
                      └────────────────────┬───────────────────┘
                                           │
                                           ▼
                      ┌────────────────────────────────────────┐
                      │            Amazon S3 Bucket            │
                      │  - Static React + Vite SPA Assets      │
                      │  - Encrypted (AES-256), Private Origin │
                      └────────────────────────────────────────┘

                                           ▲
                                           │ API Requests (VITE_API_BASE_URL)
                                           │
                      ┌────────────────────────────────────────┐
                      │       Amazon API Gateway HTTP API      │
                      │  - Route: ANY /{proxy+} & ANY /        │
                      │  - Low Latency ($1.00 / million reqs)  │
                      │  - Automatic CORS preflight handling   │
                      └────────────────────┬───────────────────┘
                                           │
                                           ▼
                      ┌────────────────────────────────────────┐
                      │          AWS Lambda (Python 3.11)      │
                      │  - Architecture: Graviton2 (arm64)     │
                      │  - Memory: 512 MB, Timeout: 29s        │
                      │  - Mangum ASGI Adapter + FastAPI       │
                      │  - Deterministic Allocation Engine     │
                      │  - Chemical Compatibility Screener     │
                      └────────────────────┬───────────────────┘
                                           │
                                           ▼
                      ┌────────────────────────────────────────┐
                      │        Amazon CloudWatch Logs          │
                      │  - Log Group: /aws/lambda/blueloop-*   │
                      │  - Retention: 7 Days (Zero Cost Drift) │
                      └────────────────────────────────────────┘
```

---

## 3. Infrastructure-as-Code: AWS SAM Template

The deployment is managed by **AWS Serverless Application Model (SAM)** defined in [`infra/template.yaml`](template.yaml):

- **`BlueLoopHttpApi`** (`AWS::Serverless::HttpApi`): Low-latency API Gateway v2 HTTP API with configured CORS origins (`*`) and methods (`GET, POST, PATCH, DELETE, OPTIONS`).
- **`BlueLoopFunction`** (`AWS::Serverless::Function`): Serverless execution of the FastAPI application packaged with Python 3.11 on arm64 (Graviton2).
- **`BlueLoopLogGroup`** (`AWS::Logs::LogGroup`): Structured logging with automatic 7-day retention expiry to prevent storage accumulation.
- **`FrontendBucket`** (`AWS::S3::Bucket`): Private S3 bucket storing static React assets with public access completely blocked.
- **`CloudFrontOAC`** (`AWS::CloudFront::OriginAccessControl`): AWS SigV4 signed origin access control for S3.
- **`CloudFrontDistribution`** (`AWS::CloudFront::Distribution`): Global CDN with automatic HTTP-to-HTTPS redirect, asset compression, and 403/404 SPA fallback handling.
- **`FrontendBucketPolicy`** (`AWS::S3::BucketPolicy`): Read-only policy granting CloudFront distribution principal access.

---

## 4. Packaging and Deployment Automation

The repository provides a single automation script [`scripts/deploy.sh`](../scripts/deploy.sh):

### A. Dry-Run Verification (No Cloud Resources Provisioned)
```bash
./scripts/deploy.sh --dry-run
```
1. Validates and lints `infra/template.yaml` using `sam validate --lint`.
2. Packages the Python Lambda backend and dependencies into `.aws-sam/build/`.
3. Typechecks, tests, and builds the React frontend into `frontend/dist/`.

### B. Live Provisioning (When Approved)
```bash
./scripts/deploy.sh --deploy --region ap-south-1 --stack-name blueloop-prod
```
1. Deploys the SAM CloudFormation stack to the target AWS region (`ap-south-1`).
2. Extracts CloudFormation stack outputs (`ApiGatewayEndpoint`, `FrontendBucketName`, `CloudFrontUrl`).
3. Re-builds the frontend with `VITE_API_BASE_URL` pointing to the deployed API Gateway endpoint.
4. Uploads production assets to the private S3 bucket via `aws s3 sync`.
5. Invalidates CloudFront edge caches (`aws cloudfront create-invalidation`).

---

## 5. Persistence, State, and Security Boundaries

1. **Persistence Boundary**:
   - In the serverless deployment, the verified seed catalog is loaded on Lambda container cold start.
   - Allocation runs, proposal acceptances/rejections, and delivery records are preserved in process memory across warm container invocations.
   - When the Lambda container rotates or scales to zero, runtime session data returns to the verified seed catalog baseline.
2. **Access Control Boundary**:
   - The hackathon demonstration is exposed with public read-only and simulation access.
   - No customer authentication or administrative account changes are permitted without upcoming Amazon Cognito integration.
3. **Synthetic Data Policy**:
   - All facilities, water quality test metrics, and buyer demands are explicitly tagged with `is_synthetic: true` to prevent fraudulent environmental claims.

---

## 6. Estimated Costs & Resource Safety

| AWS Service | Tier / Dimension | Estimated Monthly Cost |
| :--- | :--- | :--- |
| **AWS Lambda** | 512 MB, ~150 ms/invocation, arm64 | Free Tier (up to 1M reqs/mo) / <$0.05 |
| **API Gateway HTTP API** | HTTP API v2 ($1.00 / 1M reqs) | Free Tier (up to 1M reqs/mo) / <$0.02 |
| **Amazon S3** | Static assets (~1.5 MB) | <$0.01 / month |
| **Amazon CloudFront** | Data transfer out (<5 GB) | Free Tier (up to 1 TB/mo) / <$0.05 |
| **CloudWatch Logs** | 7-day retention, <100 MB logs | Free Tier (up to 5 GB/mo) / $0.00 |
| **Total Estimated Cost** | **Serverless Pay-As-You-Go** | **<$0.20 / month** |

*No NAT Gateways, no always-on EC2 instances, no RDS databases, and no Application Load Balancers.*

---

## 7. Teardown and Cleanup Instructions

To completely remove all deployed AWS resources and prevent any ongoing charges:

```bash
# 1. Empty the S3 static assets bucket
FRONTEND_BUCKET=$(aws cloudformation describe-stacks \
  --stack-name blueloop-prod \
  --region ap-south-1 \
  --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" \
  --output text)

aws s3 rm "s3://$FRONTEND_BUCKET" --recursive --region ap-south-1

# 2. Delete the CloudFormation stack
sam delete \
  --stack-name blueloop-prod \
  --region ap-south-1 \
  --no-prompts
```
