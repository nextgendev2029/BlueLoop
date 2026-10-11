#!/usr/bin/env bash
# ==============================================================================
# BlueLoop AWS Serverless Deployment & Packaging Automation Script
# Supports:
#   --dry-run : Validates templates, packages backend with SAM, and builds frontend
#   --deploy  : Provisions CloudFormation stack, uploads SPA to S3, and invalidates CDN
# ==============================================================================

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REGION="${AWS_REGION:-ap-south-1}"
STACK_NAME="${STACK_NAME:-blueloop-prod}"
ENV_NAME="${ENVIRONMENT:-prod}"
MODE="dry-run"

# Parse CLI flags
while [[ "$#" -gt 0 ]]; do
  case $1 in
    --deploy) MODE="deploy" ;;
    --dry-run) MODE="dry-run" ;;
    --region) REGION="$2"; shift ;;
    --stack-name) STACK_NAME="$2"; shift ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
  shift
done

echo "=============================================================================="
echo " BlueLoop AWS Deployment Orchestrator"
echo " Mode:       $MODE"
echo " Region:     $REGION"
echo " Stack:      $STACK_NAME"
echo " Directory:  $REPO_ROOT"
echo "=============================================================================="

# 1. Template Validation
echo ""
echo "--> [1/4] Validating AWS SAM Infrastructure Template..."
sam validate --lint --template-file "$REPO_ROOT/infra/template.yaml"
echo "✓ SAM template validation and linting passed."

# 2. Backend Packaging via SAM
echo ""
echo "--> [2/4] Building Backend Lambda Artifacts with SAM..."
sam build --template-file "$REPO_ROOT/infra/template.yaml"
echo "✓ Backend artifacts compiled into .aws-sam/build/."

# 3. Frontend Production Build
echo ""
echo "--> [3/4] Validating and Building Frontend React SPA..."
cd "$REPO_ROOT/frontend"
npm run typecheck
npm test
rm -rf dist
npm run build
echo "✓ Frontend built successfully into frontend/dist/."

# 4. Deployment or Dry-Run Completion
if [ "$MODE" == "dry-run" ]; then
  echo ""
  echo "=============================================================================="
  echo "✓ DRY RUN SUCCESSFUL - All artifacts compiled and verified."
  echo "  No live AWS resources were created or modified."
  echo ""
  echo "  To execute live deployment, run:"
  echo "    ./scripts/deploy.sh --deploy --region $REGION --stack-name $STACK_NAME"
  echo "=============================================================================="
  exit 0
fi

# Live Deployment Execution
echo ""
echo "--> [4/4] Executing Live AWS Deployment to $REGION..."
cd "$REPO_ROOT"

echo "Deploying SAM CloudFormation stack: $STACK_NAME..."
sam deploy \
  --template-file .aws-sam/build/template.yaml \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --capabilities CAPABILITY_IAM \
  --resolve-s3 \
  --parameter-overrides Environment="$ENV_NAME" \
  --no-confirm-changeset \
  --no-fail-on-empty-changeset

# Retrieve Stack Outputs
echo "Retrieving CloudFormation stack outputs..."
API_ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='ApiGatewayEndpoint'].OutputValue" \
  --output text)

FRONTEND_BUCKET=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" \
  --output text)

CLOUDFRONT_URL=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='CloudFrontUrl'].OutputValue" \
  --output text)

CLOUDFRONT_DIST_ID=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionId'].OutputValue" \
  --output text)

echo "Discovered API Endpoint: $API_ENDPOINT"
echo "Discovered S3 Bucket:   $FRONTEND_BUCKET"
echo "Discovered CloudFront:  $CLOUDFRONT_URL"

# Re-build frontend with deployed API endpoint
echo ""
if [ -z "$API_ENDPOINT" ] || [ "$API_ENDPOINT" == "None" ]; then
  echo "ERROR: Failed to retrieve API Gateway Endpoint from stack outputs. Aborting."
  exit 1
fi
if [ -z "$FRONTEND_BUCKET" ] || [ "$FRONTEND_BUCKET" == "None" ]; then
  echo "ERROR: Failed to retrieve Frontend S3 Bucket from stack outputs. Aborting."
  exit 1
fi

echo "Cleaning stale build artifacts and rebuilding frontend configured with deployed API URL..."
cd "$REPO_ROOT/frontend"
rm -rf dist
VITE_API_BASE_URL="$API_ENDPOINT" npm run build

# Verify build output exists before attempting S3 sync
if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
  echo "ERROR: Frontend build output missing dist/index.html. Aborting S3 upload."
  exit 1
fi
echo "✓ Verified production frontend build in dist/."

# Sync assets to S3
echo "Syncing frontend dist/ to S3 bucket $FRONTEND_BUCKET..."
aws s3 sync dist/ "s3://$FRONTEND_BUCKET" --delete --region "$REGION"

# Invalidate CloudFront cache
if [ -n "$CLOUDFRONT_DIST_ID" ] && [ "$CLOUDFRONT_DIST_ID" != "None" ]; then
  echo "Invalidating CloudFront CDN cache..."
  aws cloudfront create-invalidation \
    --distribution-id "$CLOUDFRONT_DIST_ID" \
    --paths "/*" \
    --query "Invalidation.Id" \
    --output text
fi

echo ""
echo "=============================================================================="
echo "✓ DEPLOYMENT COMPLETE"
echo "  Public Frontend URL: $CLOUDFRONT_URL"
echo "  Backend API URL:     $API_ENDPOINT"
echo "  Health Endpoint:     $API_ENDPOINT/api/v1/health"
echo "=============================================================================="
