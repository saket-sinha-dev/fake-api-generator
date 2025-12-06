# Docker Quick Reference

## Quick Start Commands

### Development Mode (with hot-reload)
```bash
./docker.sh dev                 # Start with logs
./docker.sh dev:detached        # Start in background
```

### Production Mode
```bash
./docker.sh prod                # Build and start
./docker.sh stop                # Stop services
./docker.sh status              # Check health
```

### Viewing Logs
```bash
./docker.sh logs dev            # Development logs
./docker.sh logs prod           # Production logs
./docker.sh logs mongodb        # Database logs
```

### Management
```bash
./docker.sh shell app           # Access app container
./docker.sh shell mongo         # Access MongoDB shell
./docker.sh backup              # Backup database
./docker.sh clean               # Remove all (WARNING: deletes data)
```

## Manual Docker Compose Commands

### Development
```bash
docker compose --profile dev up          # Start dev with logs
docker compose --profile dev up -d       # Start dev detached
docker compose --profile dev down        # Stop dev
```

### Production
```bash
docker compose --profile prod up -d      # Start production
docker compose --profile prod down       # Stop production
docker compose logs -f app-prod          # View logs
```

### Rebuild After Changes
```bash
docker compose build --no-cache          # Rebuild all images
docker compose --profile prod up -d --build  # Rebuild and start
```

## Environment Setup

### First Time Setup
```bash
# 1. Copy environment template
cp .env.docker .env

# 2. Edit environment variables
nano .env
# Required:
#   - MONGO_ROOT_PASSWORD
#   - NEXTAUTH_SECRET (generate: openssl rand -base64 32)
#   - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET

# 3. Start services
./docker.sh dev
```

## Common Tasks

### View Application Status
```bash
docker compose ps                        # Container status
docker stats                             # Resource usage
curl http://localhost:3000/api/health    # Health check
```

### Database Operations
```bash
# Access MongoDB shell
docker exec -it fake-api-mongodb mongosh -u admin -p password

# Backup MongoDB
docker exec fake-api-mongodb mongodump \
  --uri="mongodb://admin:password@localhost:27017/fake_api_generator?authSource=admin" \
  --out=/tmp/backup

# Export backup from container
docker cp fake-api-mongodb:/tmp/backup ./backup-$(date +%Y%m%d)
```

### Troubleshooting

#### Check container logs
```bash
docker compose logs app-prod             # Application logs
docker compose logs mongodb              # Database logs
docker compose logs -f                   # All logs (follow)
```

#### Restart services
```bash
docker compose restart app-prod          # Restart app only
docker compose restart mongodb           # Restart database only
docker compose restart                   # Restart all
```

#### Clean start
```bash
docker compose down                      # Stop all
docker system prune -f                   # Clean unused resources
docker compose up --build -d             # Rebuild and start
```

#### Port already in use
```bash
# Option 1: Stop existing service
lsof -ti:3000 | xargs kill -9            # Kill process on port 3000

# Option 2: Change port in docker-compose.yml
# Edit: ports: - "8080:3000"
```

## Security Commands

### Run security audit
```bash
npm run security:audit                   # Full security check
npm audit --production                   # Check dependencies
docker scan fake-api-generator:test      # Scan Docker image
```

### Update dependencies
```bash
npm outdated                             # Check outdated packages
npm update                               # Update to latest patch
npm audit fix                            # Fix vulnerabilities
```

## Performance Monitoring

### Resource usage
```bash
docker stats                             # Real-time stats
docker system df                         # Disk usage
```

### Container inspection
```bash
docker inspect fake-api-generator-prod   # Full container info
docker top fake-api-generator-prod       # Process list
```

## Production Deployment Checklist

- [ ] Update .env with production values
- [ ] Generate strong NEXTAUTH_SECRET
- [ ] Configure production MongoDB credentials
- [ ] Set correct NEXTAUTH_URL
- [ ] Build production images: `docker compose build --no-cache`
- [ ] Run security audit: `npm run security:audit`
- [ ] Test health endpoint: `curl http://localhost:3000/api/health`
- [ ] Configure reverse proxy (Nginx/Caddy) for HTTPS
- [ ] Set up automated backups
- [ ] Configure monitoring and alerts

## Useful Links

- Full Documentation: [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)
- Security Info: [SECURITY.md](./SECURITY.md)
- MongoDB Setup: [MONGODB_SETUP.md](./MONGODB_SETUP.md)
- Main README: [README.md](../README.md)
