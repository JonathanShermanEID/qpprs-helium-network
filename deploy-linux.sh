#!/bin/bash
#
# Helium-Manus Integration Platform - Linux Deployment Script
# Author: Jonathan Sherman
# Monaco Edition 🏎️
#

set -e

echo "🚀 Helium-Manus Integration Platform - Linux Deployment"
echo "=========================================================="
echo ""

# Configuration
APP_NAME="helium-manus"
APP_DIR="/home/ubuntu/helium-manus-web"
DEPLOY_DIR="/opt/helium-manus"
LOG_DIR="/var/log/helium-manus"
PID_FILE="/var/run/helium-manus.pid"
PORT=3000

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root for system-wide deployment
check_permissions() {
    if [ "$EUID" -ne 0 ] && [ "$1" == "system" ]; then
        log_warning "System-wide deployment requires sudo privileges"
        log_info "Running user-level deployment instead..."
        DEPLOY_MODE="user"
    else
        DEPLOY_MODE="${1:-user}"
    fi
}

# Install dependencies
install_dependencies() {
    log_info "Checking dependencies..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js not found. Please install Node.js 22.13.0 or later"
        exit 1
    fi
    
    # Check pnpm
    if ! command -v pnpm &> /dev/null; then
        log_warning "pnpm not found. Installing..."
        npm install -g pnpm
    fi
    
    log_success "Dependencies OK"
}

# Build application
build_app() {
    log_info "Building production application..."
    cd "$APP_DIR"
    
    # Install node modules if needed
    if [ ! -d "node_modules" ]; then
        log_info "Installing node modules..."
        pnpm install
    fi
    
    # Build
    pnpm build
    
    log_success "Build complete"
}

# Setup directories
setup_directories() {
    log_info "Setting up deployment directories..."
    
    if [ "$DEPLOY_MODE" == "system" ]; then
        sudo mkdir -p "$DEPLOY_DIR" "$LOG_DIR"
        sudo chown -R $USER:$USER "$DEPLOY_DIR" "$LOG_DIR"
    else
        mkdir -p "$HOME/helium-deploy/app" "$HOME/helium-deploy/logs"
        DEPLOY_DIR="$HOME/helium-deploy/app"
        LOG_DIR="$HOME/helium-deploy/logs"
    fi
    
    log_success "Directories created"
}

# Copy files
deploy_files() {
    log_info "Deploying application files..."
    
    # Copy built files
    cp -r "$APP_DIR/dist" "$DEPLOY_DIR/"
    cp -r "$APP_DIR/node_modules" "$DEPLOY_DIR/"
    cp "$APP_DIR/package.json" "$DEPLOY_DIR/"
    cp -r "$APP_DIR/drizzle" "$DEPLOY_DIR/" 2>/dev/null || true
    cp -r "$APP_DIR/scripts" "$DEPLOY_DIR/" 2>/dev/null || true
    
    log_success "Files deployed to $DEPLOY_DIR"
}

# Create systemd service (if system mode)
create_service() {
    if [ "$DEPLOY_MODE" == "system" ]; then
        log_info "Creating systemd service..."
        
        cat > /tmp/helium-manus.service << EOF
[Unit]
Description=Helium-Manus Integration Platform
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$DEPLOY_DIR
ExecStart=/usr/bin/node $DEPLOY_DIR/dist/index.js
Restart=always
RestartSec=10
StandardOutput=append:$LOG_DIR/app.log
StandardError=append:$LOG_DIR/error.log

Environment=NODE_ENV=production
Environment=PORT=$PORT

[Install]
WantedBy=multi-user.target
EOF
        
        sudo mv /tmp/helium-manus.service /etc/systemd/system/
        sudo systemctl daemon-reload
        sudo systemctl enable helium-manus
        
        log_success "Systemd service created"
    fi
}

# Start application
start_app() {
    log_info "Starting application..."
    
    if [ "$DEPLOY_MODE" == "system" ]; then
        sudo systemctl start helium-manus
        sleep 2
        sudo systemctl status helium-manus --no-pager
    else
        # User mode - use PM2 or nohup
        if command -v pm2 &> /dev/null; then
            cd "$DEPLOY_DIR"
            pm2 start dist/index.js --name helium-manus
            pm2 save
        else
            cd "$DEPLOY_DIR"
            nohup node dist/index.js > "$LOG_DIR/app.log" 2> "$LOG_DIR/error.log" &
            echo $! > "$HOME/helium-deploy/helium-manus.pid"
        fi
    fi
    
    log_success "Application started on port $PORT"
}

# Verify deployment
verify_deployment() {
    log_info "Verifying deployment..."
    
    sleep 3
    
    if curl -s http://localhost:$PORT > /dev/null; then
        log_success "✅ Application is responding!"
        log_success "🌐 Access at: http://localhost:$PORT"
    else
        log_warning "Application may still be starting..."
        log_info "Check logs at: $LOG_DIR/"
    fi
}

# Main deployment flow
main() {
    echo ""
    log_info "Starting deployment process..."
    echo ""
    
    check_permissions "${1:-user}"
    install_dependencies
    build_app
    setup_directories
    deploy_files
    create_service
    start_app
    verify_deployment
    
    echo ""
    log_success "=========================================="
    log_success "🎉 Deployment Complete!"
    log_success "=========================================="
    echo ""
    log_info "Application: Helium-Manus Integration Platform"
    log_info "Mode: $DEPLOY_MODE"
    log_info "Location: $DEPLOY_DIR"
    log_info "Logs: $LOG_DIR"
    log_info "Port: $PORT"
    echo ""
    log_info "Access your application at: http://localhost:$PORT"
    echo ""
    
    if [ "$DEPLOY_MODE" == "system" ]; then
        log_info "Manage with: sudo systemctl {start|stop|restart|status} helium-manus"
    else
        if command -v pm2 &> /dev/null; then
            log_info "Manage with: pm2 {start|stop|restart|logs} helium-manus"
        else
            log_info "Stop with: kill \$(cat $HOME/helium-deploy/helium-manus.pid)"
        fi
    fi
    echo ""
    log_info "Author: Jonathan Sherman"
    log_info "Monaco Edition 🏎️"
    echo ""
}

# Run main function
main "$@"
