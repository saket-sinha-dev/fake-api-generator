#!/usr/bin/env node
import 'dotenv/config';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import connectDB from '../src/lib/mongodb';
import { UserProfile as UserProfileModel } from '../src/models';
import { sendAdminCredentials } from '../src/lib/email';

/**
 * Initialize admin user on first run
 * Checks if any admin user exists, creates one if not
 */
async function initializeAdmin() {
  try {
    console.log('🔍 Checking for admin users...');
    
    await connectDB();

    // Check if any admin user exists
    const adminExists = await UserProfileModel.findOne({ role: 'admin' });

    if (adminExists) {
      console.log('✅ Admin user already exists:', adminExists.email);
      return;
    }

    console.log('📝 No admin user found. Creating admin account...');

    // Get admin email from environment or use default
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';

    // Check if this email already exists as a regular user
    const existingUser = await UserProfileModel.findOne({ email: adminEmail.toLowerCase() });

    if (existingUser) {
      // Promote existing user to admin
      existingUser.role = 'admin';
      await existingUser.save();
      console.log(`✅ Promoted existing user ${adminEmail} to admin role`);
      return;
    }

    // Generate temporary password (16 characters, alphanumeric)
    const tempPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create admin user
    await UserProfileModel.create({
      email: adminEmail.toLowerCase(),
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isEmailVerified: true,
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Temporary Password:', tempPassword);
    console.log('');
    console.log('⚠️  IMPORTANT: Please change this password after first login!');
    console.log('');

    // Send email with credentials (non-blocking)
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      console.log('📨 Sending admin credentials email...');
      const emailResult = await sendAdminCredentials(adminEmail, tempPassword);
      
      if (emailResult.success) {
        console.log('✅ Admin credentials email sent successfully!');
      } else {
        console.log('⚠️  Failed to send email. Please note the credentials above.');
      }
    } else {
      console.log('⚠️  Email service not configured. Admin credentials are displayed above.');
      console.log('💡 Configure SMTP settings in .env to enable email notifications.');
    }

  } catch (error) {
    console.error('❌ Failed to initialize admin user:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeAdmin()
  .then(() => {
    console.log('✨ Admin initialization complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Admin initialization failed:', error);
    process.exit(1);
  });
