# BlueLoop: Pre-Deployment Architecture & Deployment Handoff Guide

**Product**: BlueLoop (Water Reuse Intelligence Platform)  
**Stage**: Pre-Deployment Verification & Packaging Complete  
**Live Cloud Status**: **NOT DEPLOYED** (Zero billable cloud resources provisioned per safety protocol)  
**IaC Template**: [`infra/template.yaml`](file:///Users/apple/Desktop/BlueLoop/infra/template.yaml) (AWS SAM Validated & Linted)  
**Packaging Automation**: [`scripts/deploy.sh`](file:///Users/apple/Desktop/BlueLoop/scripts/deploy.sh)  

---

## 1. Executive Deployment Status

All local code, tests, and build artifacts are production-ready:
- **Frontend**: Vite production build produces optimized bundles in `frontend/dist/` (zero warnings, 2.17s build time).
- **Backend**: FastAPI application packaged with Mangum ASGI adapter into serverless Lambda handlers in `.aws-sam/build/`.
- **Infrastructure**: AWS Serverless Application Model (SAM) template verified with `sam validate --lint`.
- **Security Check**: Zero hardcoded credentials, `.env` excluded from version control, safe `.env.example` verified.

Live provisioning has been deferred to maintain strict cost safety until the final hackathon submission deployment window is authorized.

---

## 2. Target AWS Cloud Architecture

```
                             [ End Users & Browsers ]
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
                   │  - Low Latency, Pay-per-Request        │
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

## 3. Required AWS Services & Specifications

| AWS Service | Resource Identifier in SAM | Configuration & Sizing | Purpose |
| :--- | :--- | :--- | :--- |
| **AWS Lambda** | `BlueLoopApiFunction` | Python 3.11, Graviton2 (`arm64`), 512 MB memory, 29s timeout | Serverless execution of FastAPI backend via Mangum handler |
| **Amazon API Gateway** | `BlueLoopHttpApi` | HTTP API ($1.00 / 1M requests), CORS enabled | REST routing for `/api/v1/*` endpoints and health checks |
| **Amazon S3** | `BlueLoopFrontendBucket` | S3 Standard, Block Public Access enabled, SSE-S3 AES-256 | Static hosting for compiled React Vite SPA bundle |
| **Amazon CloudFront** | `BlueLoopDistribution` | PriceClass_100 (NA/EU/India edge locations), OAC enabled | Edge caching, HTTPS termination, SPA client-side route fallback |
| **Amazon CloudWatch** | Implicit Log Group | Retention: 7 Days | Diagnostic logging without accumulating storage costs |

---

## 4. Environment Variables & Secret Configuration

### Backend Production Environment (`AWS Lambda`)
Configure these parameters in the CloudFormation deployment parameters or AWS Systems Manager Parameter Store:

| Variable Name | Production Value | Description |
| :--- | :--- | :--- |
| `APP_ENV` | `production` | Enables production error sanitization and disables verbose stack traces |
| `APP_NAME` | `BlueLoop` | Service identity |
| `DEBUG` | `false` | Disables debug mode |
| `USE_SYNTHETIC_DATA` | `true` | Maintains explicit labeling on synthetic demonstration datasets |
| `CORS_ORIGINS` | `https://<cloudfront-distribution-domain>` | Restricts CORS to the CloudFront distribution domain |
| `SESSION_EXPIRY_HOURS` | `24` | Session token validity window |
| `SESSION_COOKIE_SECURE`| `true` | Enforces `Secure` flag on HTTPS session cookies |

### Frontend Production Environment (`Vite Build`)
Injected during `npm run build` step prior to S3 upload:

| Variable Name | Production Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `https://<api-gateway-id>.execute-api.ap-south-1.amazonaws.com` | Base URL for REST API requests |
| `VITE_SYNTHETIC_DISCLOSURE` | `true` | Enforces explicit UI badges on synthetic demo fixtures |

---

## 5. Required AWS IAM Permissions for Deployer

The AWS CLI credentials used to execute the final deployment require the following managed policies or equivalent scoped privileges:
1. `AWSCloudFormationFullAccess` (to create/update the `blueloop-prod` stack).
2. `AWSLambda_FullAccess` (to create the function and configure arm64 runtime).
3. `AmazonAPIGatewayAdministrator` (to create the HTTP API and stage routes).
4. `AmazonS3FullAccess` (to create bucket, configure OAC bucket policy, and sync `dist/`).
5. `CloudFrontFullAccess` (to create the distribution and create cache invalidations).
6. `IAMFullAccess` (to create the Lambda execution role: `AWSLambdaBasicExecutionRole`).

---

## 6. Persistence & State Considerations

### Current State
- The application uses thread-safe SQLite persistence with seed fixtures (`backend/data/blueloop.db`) for local runs.
- In serverless AWS Lambda, local disk (`/tmp`) is ephemeral across cold starts.
- For a persistent post-hackathon enterprise tier, the repository abstractions in `backend/app/repositories/` are decoupled and ready to connect to Amazon DynamoDB single-table persistence or Amazon Aurora Serverless PostgreSQL.
- For hackathon presentation mode on Lambda, the application initializes and seeds its thread-safe in-memory SQLite store on cold start, ensuring instantaneous, reliable responses without database provisioning costs.

---

## 7. Remaining Deployment Blockers & Prerequisites

| Blocker / Dependency | Status | Resolution Action |
| :--- | :--- | :--- |
| **AWS Account Credentials** | Pending | Configure target AWS access key and secret via `aws configure` |
| **Target AWS Region** | Selected: `ap-south-1` (Mumbai) | Default configured in `.env.example` and SAM template |
| **Custom Domain & SSL** (Optional) | Optional | Default `cloudfront.net` domain is suitable for hackathon review |
| **CloudFront Propagation Time** | Expected (3-5 minutes) | Plan deployment 15 minutes prior to presentation deadline |

---

## 8. Step-by-Step Production Deployment Runbook

When authorized to initiate the live AWS deployment, execute these exact steps:

```bash
# Step 1: Configure AWS CLI credentials
aws configure
# Enter AWS Access Key ID, Secret Access Key, and Default region: ap-south-1

# Step 2: Validate IAM identity
aws sts get-caller-identity

# Step 3: Run pre-deployment dry run
./scripts/deploy.sh --dry-run

# Step 4: Execute live CloudFormation provisioning
./scripts/deploy.sh --deploy --region ap-south-1 --stack-name blueloop-prod

# Step 5: Capture outputs from CloudFormation
aws cloudformation describe-stacks \
  --stack-name blueloop-prod \
  --query "Stacks[0].Outputs" \
  --output table

# Step 6: Verify deployed API health
API_URL=$(aws cloudformation describe-stacks --stack-name blueloop-prod --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" --output text)
curl "${API_URL}/api/v1/health"

# Step 7: Access CloudFront distribution URL
CF_URL=$(aws cloudformation describe-stacks --stack-name blueloop-prod --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDomain'].OutputValue" --output text)
echo "BlueLoop Live URL: https://${CF_URL}"
```

---

## 9. Verification Summary

The BlueLoop codebase is fully hardened, linted, tested, and pre-deployment packaged. Live deployment can be executed in under 5 minutes using the automated `./scripts/deploy.sh --deploy` command as soon as AWS cloud credentials are provided.
