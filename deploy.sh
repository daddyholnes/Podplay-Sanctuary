#!/bin/bash
# Podplay Sanctuary Cloud Deployment Script
# Deploy both frontend and backend to Google Cloud Run

set -e  # Exit on any error

echo "🐻 Mama Bear Cloud Deployment Starting..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID=${GOOGLE_CLOUD_PROJECT:-"podplay-build-beta"}
REGION=${REGION:-"europe-west1"}
FRONTEND_SERVICE="podplay-sanctuary-frontend"
BACKEND_SERVICE="mama-bear-backend"

echo -e "${BLUE}📋 Deployment Configuration:${NC}"
echo -e "  Project ID: ${YELLOW}$PROJECT_ID${NC}"
echo -e "  Region: ${YELLOW}$REGION${NC}"
echo -e "  Frontend Service: ${YELLOW}$FRONTEND_SERVICE${NC}"
echo -e "  Backend Service: ${YELLOW}$BACKEND_SERVICE${NC}"
echo ""

# Function to check if gcloud is installed and authenticated
check_gcloud() {
    if ! command -v gcloud &> /dev/null; then
        echo -e "${RED}❌ gcloud CLI is not installed. Please install it first.${NC}"
        exit 1
    fi
    
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        echo -e "${RED}❌ No active gcloud authentication found. Please run 'gcloud auth login'${NC}"
        exit 1
    fi
}

# Function to build and test locally first
build_locally() {
    echo -e "${BLUE}🔨 Building locally first...${NC}"
    
    echo -e "${YELLOW}  Building frontend...${NC}"
    cd frontend
    if npm ci && npm run build; then
        echo -e "${GREEN}  ✅ Frontend build successful${NC}"
    else
        echo -e "${RED}  ❌ Frontend build failed${NC}"
        exit 1
    fi
    cd ..
    
    echo -e "${YELLOW}  Testing backend dependencies...${NC}"
    cd backend
    if python -c "import flask, gunicorn; print('✅ Backend dependencies OK')"; then
        echo -e "${GREEN}  ✅ Backend dependencies available${NC}"
    else
        echo -e "${RED}  ❌ Backend dependencies missing. Run: pip install -r requirements.txt${NC}"
        exit 1
    fi
    cd ..
}

# Function to deploy using Cloud Build
deploy_with_cloudbuild() {
    echo -e "${BLUE}🚀 Deploying with Cloud Build...${NC}"
    
    gcloud builds submit --config cloudbuild.yaml \
        --project "$PROJECT_ID" \
        --region "$REGION"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Cloud Build deployment successful!${NC}"
        get_service_urls
    else
        echo -e "${RED}❌ Cloud Build deployment failed${NC}"
        exit 1
    fi
}

# Function to get service URLs
get_service_urls() {
    echo -e "${BLUE}🌐 Getting service URLs...${NC}"
    
    FRONTEND_URL=$(gcloud run services describe "$FRONTEND_SERVICE" \
        --region="$REGION" \
        --project="$PROJECT_ID" \
        --format="value(status.url)" 2>/dev/null || echo "Not deployed")
    
    BACKEND_URL=$(gcloud run services describe "$BACKEND_SERVICE" \
        --region="$REGION" \
        --project="$PROJECT_ID" \
        --format="value(status.url)" 2>/dev/null || echo "Not deployed")
    
    echo -e "${GREEN}🎉 Deployment Complete!${NC}"
    echo -e "  Frontend URL: ${BLUE}$FRONTEND_URL${NC}"
    echo -e "  Backend URL:  ${BLUE}$BACKEND_URL${NC}"
    echo ""
    echo -e "${YELLOW}📝 Next Steps:${NC}"
    echo -e "  1. Update frontend API endpoints to point to backend URL"
    echo -e "  2. Configure CORS settings in backend for frontend URL"
    echo -e "  3. Set up custom domain if needed"
}

# Function for manual deployment (alternative)
deploy_manual() {
    echo -e "${BLUE}🔧 Manual deployment mode...${NC}"
    
    # Build and push frontend
    echo -e "${YELLOW}  Building frontend Docker image...${NC}"
    cd frontend
    docker build -t "gcr.io/$PROJECT_ID/$FRONTEND_SERVICE" .
    docker push "gcr.io/$PROJECT_ID/$FRONTEND_SERVICE"
    cd ..
    
    # Build and push backend
    echo -e "${YELLOW}  Building backend Docker image...${NC}"
    cd backend
    docker build -t "gcr.io/$PROJECT_ID/$BACKEND_SERVICE" .
    docker push "gcr.io/$PROJECT_ID/$BACKEND_SERVICE"
    cd ..
    
    # Deploy frontend
    echo -e "${YELLOW}  Deploying frontend...${NC}"
    gcloud run deploy "$FRONTEND_SERVICE" \
        --image "gcr.io/$PROJECT_ID/$FRONTEND_SERVICE" \
        --region "$REGION" \
        --allow-unauthenticated \
        --port 8080 \
        --memory 1Gi
    
    # Deploy backend
    echo -e "${YELLOW}  Deploying backend...${NC}"
    gcloud run deploy "$BACKEND_SERVICE" \
        --image "gcr.io/$PROJECT_ID/$BACKEND_SERVICE" \
        --region "$REGION" \
        --allow-unauthenticated \
        --port 8080 \
        --memory 2Gi \
        --set-env-vars "FLASK_ENV=production,PYTHONPATH=/app"
}

# Main execution
main() {
    echo -e "${GREEN}🐻 Welcome to Mama Bear's Cloud Deployment Sanctuary! 🐻${NC}"
    echo ""
    
    check_gcloud
    build_locally
    
    echo -e "${BLUE}Choose deployment method:${NC}"
    echo -e "  1) Cloud Build (recommended)"
    echo -e "  2) Manual Docker build and deploy"
    echo -e "  3) Exit"
    echo ""
    read -p "Enter your choice (1-3): " choice
    
    case $choice in
        1)
            deploy_with_cloudbuild
            ;;
        2)
            deploy_manual
            ;;
        3)
            echo -e "${YELLOW}Deployment cancelled.${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid choice. Exiting.${NC}"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
