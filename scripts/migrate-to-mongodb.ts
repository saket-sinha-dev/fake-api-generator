/**
 * Migration Script: JSON Files to MongoDB
 * 
 * Run: npx tsx scripts/migrate-to-mongodb.ts
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { join } from 'path';
config({ path: join(process.cwd(), '.env.local') });

// Import other modules
import { readFileSync } from 'fs';
import mongoose from 'mongoose';
import connectDB from '../src/lib/mongodb';
import { UserProfile, Project, Resource, API, Database } from '../src/models';

const DATA_DIR = join(process.cwd(), 'data');

async function migrateProjects() {
  console.log('Migrating projects...');
  try {
    const projectsFile = join(DATA_DIR, 'projects.json');
    const projects = JSON.parse(readFileSync(projectsFile, 'utf-8'));
    
    for (const project of projects) {
      await Project.findOneAndUpdate(
        { id: project.id },
        project,
        { upsert: true, new: true }
      );
      console.log(`✓ Migrated project: ${project.name}`);
    }
    
    console.log(`✓ Migrated ${projects.length} projects`);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.log('No projects.json found, skipping...');
    } else {
      console.error('Error migrating projects:', error.message);
    }
  }
}

async function migrateResources() {
  console.log('\nMigrating resources...');
  try {
    const resourcesFile = join(DATA_DIR, 'resources.json');
    const resources = JSON.parse(readFileSync(resourcesFile, 'utf-8'));
    
    for (const resource of resources) {
      await Resource.findOneAndUpdate(
        { id: resource.id },
        resource,
        { upsert: true, new: true }
      );
      console.log(`✓ Migrated resource: ${resource.name}`);
    }
    
    console.log(`✓ Migrated ${resources.length} resources`);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.log('No resources.json found, skipping...');
    } else {
      console.error('Error migrating resources:', error.message);
    }
  }
}

async function migrateAPIs() {
  console.log('\nMigrating custom APIs...');
  try {
    const apisFile = join(DATA_DIR, 'apis.json');
    const apis = JSON.parse(readFileSync(apisFile, 'utf-8'));
    
    for (const api of apis) {
      await API.findOneAndUpdate(
        { id: api.id },
        api,
        { upsert: true, new: true }
      );
      console.log(`✓ Migrated API: ${api.name}`);
    }
    
    console.log(`✓ Migrated ${apis.length} APIs`);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.log('No apis.json found, skipping...');
    } else {
      console.error('Error migrating APIs:', error.message);
    }
  }
}

async function migrateDatabase() {
  console.log('\nMigrating database (generated data)...');
  try {
    const databaseFile = join(DATA_DIR, 'database.json');
    const database = JSON.parse(readFileSync(databaseFile, 'utf-8'));
    
    for (const [resourceName, data] of Object.entries(database)) {
      if (resourceName !== 'userProfiles' && Array.isArray(data)) {
        await Database.findOneAndUpdate(
          { resourceName },
          { resourceName, data },
          { upsert: true, new: true }
        );
        console.log(`✓ Migrated data for: ${resourceName}`);
      }
    }
    
    console.log(`✓ Migrated database`);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.log('No database.json found, skipping...');
    } else {
      console.error('Error migrating database:', error.message);
    }
  }
}

async function migrateUsers() {
  console.log('\nMigrating user profiles...');
  try {
    const databaseFile = join(DATA_DIR, 'database.json');
    const database = JSON.parse(readFileSync(databaseFile, 'utf-8'));
    
    if (database.userProfiles) {
      for (const profile of database.userProfiles) {
        await UserProfile.findOneAndUpdate(
          { email: profile.email },
          profile,
          { upsert: true, new: true }
        );
        console.log(`✓ Migrated user: ${profile.email}`);
      }
      console.log(`✓ Migrated ${database.userProfiles.length} user profiles`);
    }
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.log('No user profiles found, skipping...');
    } else {
      console.error('Error migrating users:', error.message);
    }
  }
}

async function main() {
  console.log('===================================');
  console.log('Starting migration to MongoDB');
  console.log('===================================\n');

  // Check environment variable
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable not set');
    console.error('\nPlease complete MONGODB_SETUP.md first.');
    process.exit(1);
  }

  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('✓ Connected to MongoDB\n');

    await migrateProjects();
    await migrateResources();
    await migrateAPIs();
    await migrateDatabase();
    await migrateUsers();

    console.log('\n===================================');
    console.log('✅ Migration completed successfully!');
    console.log('===================================');
    console.log('\nNext steps:');
    console.log('1. Verify data in MongoDB (Atlas Dashboard or Compass)');
    console.log('2. Backup your data/ folder');
    console.log('3. Restart your development server');
    console.log('4. Test the application');
    
    await mongoose.connection.close();
    console.log('\n✓ Disconnected from MongoDB');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

main();
