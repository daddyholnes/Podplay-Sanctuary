#!/bin/bash
# Environment Configuration Script
# Sets up environment variables for connecting frontend and backend

set -e

echo "🔧 Configuring environment for cloud deployment..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_ID=${GOOGLE_CLOUD_PROJECT:-"podplay-build-beta"}
REGION=${REGION:-"europe-west1"}

# Get service URLs
get_backend_url() {
    gcloud run services describe "mama-bear-backend" \
        --region="$REGION" \
        --project="$PROJECT_ID" \
        --format="value(status.url)" 2>/dev/null || echo ""
}

get_frontend_url() {
    gcloud run services describe "podplay-sanctuary-frontend" \
        --region="$REGION" \
        --project="$PROJECT_ID" \
        --format="value(status.url)" 2>/dev/null || echo ""
}

# Create environment files
create_frontend_env() {
    local backend_url="$1"
    local env_file="frontend/.env.production"
    
    echo -e "${BLUE}Creating frontend environment configuration...${NC}"
    
    cat > "$env_file" << EOF
# Production Environment Configuration
# Generated on $(date)

# Backend API Configuration
VITE_API_BASE_URL=$backend_url
VITE_API_ENDPOINTS_BASE=$backend_url/api

# Environment
NODE_ENV=production
VITE_APP_ENV=production

# Feature Flags
VITE_ENABLE_DEV_TOOLS=false
VITE_ENABLE_SCOUT_AGENT=true
VITE_ENABLE_MAMA_BEAR=true

# WebSocket Configuration  
VITE_WS_URL=$backend_url
VITE_SOCKETIO_URL=$backend_url

# Logo and Branding
VITE_APP_NAME="Podplay Build Sanctuary"
VITE_APP_DESCRIPTION="Your sanctuary for calm, empowered creation"
EOF

    echo -e "${GREEN}✅ Frontend environment created: $env_file${NC}"
}

create_backend_env() {
    local frontend_url="$1"
    local env_file="backend/.env.production"
    
    echo -e "${BLUE}Creating backend environment configuration...${NC}"
    
    cat > "$env_file" << EOF
# Production Environment Configuration  
# Generated on $(date)

# Flask Configuration
FLASK_ENV=production
FLASK_DEBUG=false
PYTHONPATH=/app

# Server Configuration
PORT=8080
HOST=0.0.0.0

# CORS Configuration
CORS_ORIGINS=$frontend_url,https://$frontend_url

# API Configuration
API_HOST=0.0.0.0
API_PORT=8080
API_DEBUG=false

# Database (Cloud SQL or persistent volume)
DATABASE_URL=sqlite:///sanctuary.db

# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT=$PROJECT_ID
GOOGLE_CLOUD_REGION=$REGION

# AI Services (configure as needed)
# TOGETHER_API_KEY=your_key_here
# MEM0_API_KEY=your_key_here
# GOOGLE_AI_API_KEY=your_key_here

# Feature Flags
ENABLE_SCOUT_AGENT=true
ENABLE_NIXOS_INTEGRATION=true
ENABLE_MEMORY_PERSISTENCE=true
EOF

    echo -e "${GREEN}✅ Backend environment created: $env_file${NC}"
}

update_frontend_config() {
    local backend_url="$1"
    local config_file="frontend/src/config/api.ts"
    
    if [ -f "$config_file" ]; then
        echo -e "${BLUE}Updating frontend API configuration...${NC}"
        
        # Backup original
        cp "$config_file" "$config_file.backup"
        
        # Update API base URL
        sed -i "s|const API_BASE_URL = .*|const API_BASE_URL = '$backend_url';|g" "$config_file"
        sed -i "s|baseURL: .*|baseURL: '$backend_url',|g" "$config_file"
        
        echo -e "${GREEN}✅ Frontend API config updated${NC}"
    fi
}

# Main function
main() {
    echo -e "${GREEN}🐻 Mama Bear Environment Configuration 🐻${NC}"
    echo ""
    
    # Get current URLs
    backend_url=$(get_backend_url)
    frontend_url=$(get_frontend_url)
    
    if [ -z "$backend_url" ]; then
        echo -e "${YELLOW}⚠️  Backend not deployed yet. Using placeholder URL.${NC}"
        backend_url="https://mama-bear-backend-xxxxx-ew.a.run.app"
    fi
    
    if [ -z "$frontend_url" ]; then
        echo -e "${YELLOW}⚠️  Frontend not deployed yet. Using placeholder URL.${NC}"
        frontend_url="https://podplay-sanctuary-frontend-xxxxx-ew.a.run.app"
    fi
    
    echo -e "${BLUE}Current Configuration:${NC}"
    echo -e "  Backend URL:  $backend_url"
    echo -e "  Frontend URL: $frontend_url"
    echo ""
    
    # Create environment files
    create_frontend_env "$backend_url"
    create_backend_env "$frontend_url"
    update_frontend_config "$backend_url"
    
    echo ""
    echo -e "${GREEN}🎉 Environment configuration complete!${NC}"
    echo ""
    echo -e "${YELLOW}📝 Next Steps:${NC}"
    echo -e "  1. Review the generated .env.production files"
    echo -e "  2. Add any missing API keys or secrets"
    echo -e "  3. Redeploy services if URLs have changed"
    echo -e "  4. Test the connection between frontend and backend"
}

main "$@"
