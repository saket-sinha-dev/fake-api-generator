# Docker Deployment Guide for Fake API Generator

## Overview
This guide covers Docker deployment for the Fake API Generator application with MongoDB.

## Prerequisites
- Docker Engine 20.10 or higher
- Docker Compose v2.0 or higher
- At least 2GB free disk space

## Quick Start

### 1. Environment Setup
```bash
# Copy the Docker environment template
cp .env.docker .env

# Edit .env and fill in your values:
# - MONGO_ROOT_PASSWORD (required)
# - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)
# - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (if using OAuth)
nano .env
```

### 2. Development Mode
```bash
# Start the application with hot-reload
docker compose --profile dev up

# Or run in detached mode
docker compose --profile dev up -d

# View logs
docker compose logs -f app-dev
```

Access the application at `http://localhost:3000`

### 3. Production Mode
```bash
# Start the application in production mode
docker compose --profile prod up -d

# View logs
docker compose logs -f app-prod

# Check status
docker compose ps
```

## Docker Commands

### Build and Start
```bash
# Build and start development
docker compose --profile dev up --build

# Build and start production
docker compose --profile prod up --build -d
```

### Stop and Clean
```bash
# Stop all services
docker compose down

# Stop and remove volumes (WARNING: deletes MongoDB data)
docker compose down -v

# Remove all containers, networks, and images
docker compose down --rmi all -v
```

### MongoDB Management
```bash
# Access MongoDB shell
docker exec -it fake-api-mongodb mongosh -u admin -p password

# Backup MongoDB data
docker exec fake-api-mongodb mongodump --uri="mongodb://admin:password@localhost:27017/fake_api_generator?authSource=admin" --out=/data/backup

# Restore MongoDB data
docker exec fake-api-mongodb mongorestore --uri="mongodb://admin:password@localhost:27017/fake_api_generator?authSource=admin" /data/backup
```

### Application Management
```bash
# View application logs
docker compose logs -f app-prod

# Restart application
docker compose restart app-prod

# Execute command in container
docker exec -it fake-api-generator-prod sh

# Check application health
docker inspect --format='{{json .State.Health}}' fake-api-generator-prod | jq
```

## Architecture

### Services
1. **mongodb** - MongoDB 7.0 database
   - Port: 27017
   - Persistent volumes for data
   - Health checks enabled

2. **app-dev** - Development application (profile: dev)
   - Port: 3000
   - Hot-reload enabled
   - Volume mounts for code changes

3. **app-prod** - Production application (profile: prod)
   - Port: 3000
   - Optimized multi-stage build
   - Non-root user for security

### Networks
- `fake-api-network` - Bridge network connecting all services

### Volumes
- `mongodb_data` - MongoDB database files
- `mongodb_config` - MongoDB configuration files

## Configuration

### Environment Variables

#### Required
- `MONGODB_URI` - MongoDB connection string
- `NEXTAUTH_SECRET` - Secret for NextAuth.js (generate with `openssl rand -base64 32`)

#### Optional
- `NEXTAUTH_URL` - Application URL (default: http://localhost:3000)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `MONGO_ROOT_USERNAME` - MongoDB root username (default: admin)
- `MONGO_ROOT_PASSWORD` - MongoDB root password (default: password)
- `MONGO_DB_NAME` - MongoDB database name (default: fake_api_generator)

### Port Mapping
- Application: `3000:3000`
- MongoDB: `27017:27017`

## Production Deployment

### Security Checklist
- [ ] Change default MongoDB credentials
- [ ] Generate strong NEXTAUTH_SECRET
- [ ] Configure Google OAuth with production callback URLs
- [ ] Use environment-specific NEXTAUTH_URL
- [ ] Enable HTTPS (use reverse proxy like Nginx/Caddy)
- [ ] Configure firewall rules
- [ ] Regular MongoDB backups
- [ ] Monitor container logs

### Performance Optimization
```bash
# Limit container resources
docker compose --profile prod up -d --scale app-prod=2
docker update --cpus="2" --memory="2g" fake-api-generator-prod
```

### Reverse Proxy (Nginx Example)
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Troubleshooting

### Application won't start
```bash
# Check logs
docker compose logs app-prod

# Verify environment variables
docker compose config

# Check if MongoDB is healthy
docker compose ps
```

### MongoDB connection issues
```bash
# Test MongoDB connection
docker exec -it fake-api-mongodb mongosh -u admin -p password

# Check MongoDB logs
docker compose logs mongodb

# Verify network connectivity
docker network inspect fake-api-network
```

### Port conflicts
```bash
# Change ports in docker-compose.yml
services:
  app-prod:
    ports:
      - "8080:3000"  # Use port 8080 instead
```

### Out of disk space
```bash
# Clean up unused Docker resources
docker system prune -a --volumes

# Check disk usage
docker system df
```

## Monitoring

### Health Checks
```bash
# Check application health endpoint
curl http://localhost:3000/api/health

# Check Docker health status
docker ps --format "table {{.Names}}\t{{.Status}}"
```

### Resource Usage
```bash
# Monitor container resources
docker stats

# View detailed container info
docker inspect fake-api-generator-prod
```

## Backup and Recovery

### Automated Backup Script
```bash
#!/bin/bash
# backup.sh
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# Backup MongoDB
docker exec fake-api-mongodb mongodump \
  --uri="mongodb://admin:password@localhost:27017/fake_api_generator?authSource=admin" \
  --out=/tmp/backup

docker cp fake-api-mongodb:/tmp/backup $BACKUP_DIR/mongodb

echo "Backup completed: $BACKUP_DIR"
```

### Restore from Backup
```bash
# Restore MongoDB
docker exec -i fake-api-mongodb mongorestore \
  --uri="mongodb://admin:password@localhost:27017/fake_api_generator?authSource=admin" \
  /data/backup
```

## Development Tips

### Hot Reload
Development mode automatically reloads on code changes:
```bash
docker compose --profile dev up
# Edit files in your IDE - changes appear automatically
```

### Running Tests in Docker
```bash
# Run tests in development container
docker exec -it fake-api-generator-dev npm test

# Run specific test suite
docker exec -it fake-api-generator-dev npm run test:unit
```

### Debugging
```bash
# Access container shell
docker exec -it fake-api-generator-dev sh

# View environment variables
docker exec fake-api-generator-dev env

# Check Node.js version
docker exec fake-api-generator-dev node --version
```

## Additional Resources
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MongoDB Docker Hub](https://hub.docker.com/_/mongo)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
