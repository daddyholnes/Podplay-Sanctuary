#!/bin/bash

# 🐻 Podplay Build Sanctuary - Frontend Deployment Script
# Deploy the frontend to Google Cloud Run

set -e

echo "🐻 Mama Bear Frontend Deployment - Starting deployment..."

# Configuration
PROJECT_ID="podplay-build-beta"
SERVICE_NAME="mama-bear-frontend"
REGION="europe-west1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}:latest"

# Build Docker image
echo "📦 Building Docker image..."
cd frontend
docker build -t $IMAGE_NAME .

# Push to Google Container Registry
echo "🚀 Pushing to Google Container Registry..."
docker push $IMAGE_NAME

# Deploy to Cloud Run
echo "☁️  Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10 \
  --project $PROJECT_ID

echo "✅ Frontend deployment complete!"
echo "🌐 Your frontend is now available at the URL shown above"
