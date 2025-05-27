#!/bin/bash
# Deploy backend to Google Cloud Run with proper environment variables

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🐻 Mama Bear Backend Deployment to Google Cloud Run${NC}"

# Check if we're in the right directory
if [ ! -f "backend/app.py" ]; then
    echo -e "${RED}❌ Please run this script from the project root directory${NC}"
    exit 1
fi

# Build the Docker image
echo -e "${YELLOW}📦 Building Docker image...${NC}"
cd backend
gcloud builds submit --tag gcr.io/podplay-build-beta/mama-bear-backend

# Deploy to Cloud Run with environment variables
echo -e "${YELLOW}🚀 Deploying to Cloud Run...${NC}"
gcloud run deploy mama-bear-backend \
    --image gcr.io/podplay-build-beta/mama-bear-backend \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --port 8080 \
    --set-env-vars="FLASK_ENV=production" \
    --set-env-vars="PYTHONPATH=/app" \
    --set-env-vars="ENABLE_NIXOS_SANDBOX=false" \
    --set-env-vars="ENABLE_WORKSPACE_MANAGER=false" \
    --set-env-vars="ENABLE_SCOUT_LOGGER=false" \
    --set-env-vars="MEM0_API_KEY=" \
    --memory 1Gi \
    --cpu 1 \
    --timeout 300 \
    --max-instances 10

echo -e "${GREEN}✅ Backend deployed successfully!${NC}"

# Get the service URL
SERVICE_URL=$(gcloud run services describe mama-bear-backend --region=us-central1 --format='value(status.url)')
echo -e "${GREEN}🌐 Service URL: ${SERVICE_URL}${NC}"

# Test the health endpoint
echo -e "${YELLOW}🏥 Testing health endpoint...${NC}"
curl -f "${SERVICE_URL}/health" || echo -e "${RED}❌ Health check failed${NC}"

cd ..
