# MongoDB Setup Guide

## Quick Setup Options

### Option 1: MongoDB Atlas (Cloud - Recommended)

1. **Create Free Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free (M0 tier - free forever)

2. **Create Cluster**
   - Click "Build a Database"
   - Choose **FREE Shared** tier
   - Select region closest to you
   - Click "Create Cluster"

3. **Setup Database Access**
   - Go to "Database Access" in left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `fakegen_user`
   - Password: (auto-generate or create strong password)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

4. **Setup Network Access**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Click "Confirm"

5. **Get Connection String**
   - Go back to "Database" (Clusters)
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Driver: Node.js, Version: 5.5 or later
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Replace `<dbname>` with `fakegen`

   Example:
   ```
   mongodb+srv://fakegen_user:<password>@cluster0.xxxxx.mongodb.net/fakegen?retryWrites=true&w=majority
   ```

### Option 2: Local MongoDB

1. **Install MongoDB**
   ```bash
   # macOS
   brew tap mongodb/brew
   brew install mongodb-community
   
   # Start MongoDB
   brew services start mongodb-community
   ```

2. **Connection String**
   ```
   mongodb://localhost:27017/fakegen
   ```

## Environment Configuration

Add to your `.env.local`:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://fakegen_user:your-password@cluster0.xxxxx.mongodb.net/fakegen?retryWrites=true&w=majority

# Or for local MongoDB:
# MONGODB_URI=mongodb://localhost:27017/fakegen
```

## Database Structure

The following collections will be created automatically:

1. **users**
   - Stores user profiles (email, firstName, lastName, mobile)

2. **projects**
   - Stores all projects with collaborators

3. **resources**
   - Stores resource definitions (schema)

4. **apis**
   - Stores custom API endpoints

5. **database**
   - Stores generated mock data for resources

## Migration from JSON Files

After setup, run:
```bash
npm run migrate-to-mongodb
```

This will:
- Read all JSON files in `data/` folder
- Import data to MongoDB
- Keep JSON files as backup

## Benefits Over JSON Files

✅ **Concurrent Access** - Multiple users can work simultaneously
✅ **Atomic Operations** - No race conditions
✅ **Indexing** - Fast queries with proper indexes
✅ **Scalability** - Handles large datasets efficiently
✅ **Backup & Restore** - Built-in backup tools
✅ **Cloud Hosting** - Free tier on MongoDB Atlas
✅ **Real-time** - Built-in change streams for real-time updates
✅ **Schema Validation** - Optional schema enforcement
✅ **Aggregation** - Powerful query capabilities

## Verification

After migration:
1. Visit [MongoDB Atlas Dashboard](https://cloud.mongodb.com/)
2. Browse Collections
3. Verify data was imported correctly

## Troubleshooting

### Connection Failed
- Check if IP address is whitelisted in Network Access
- Verify username/password are correct
- Ensure connection string has correct format

### Authentication Failed
- Regenerate password for database user
- Update MONGODB_URI in .env.local

### Network Timeout
- Check if MongoDB service is running (local)
- Verify network connectivity (Atlas)
- Try different region in Atlas
