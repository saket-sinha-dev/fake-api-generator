import nodemailer from 'nodemailer';

// Email configuration
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER;
const APP_NAME = process.env.APP_NAME || 'Fake API Generator';
const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // true for 465, false for other ports
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

/**
 * Send admin credentials email
 */
export async function sendAdminCredentials(email: string, temporaryPassword: string) {
  const mailOptions = {
    from: `"${APP_NAME}" <${FROM_EMAIL}>`,
    to: email,
    subject: `${APP_NAME} - Admin Credentials`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
            .credentials { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; }
            .credential-item { margin: 10px 0; }
            .credential-label { font-weight: bold; color: #667eea; }
            .credential-value { font-family: monospace; background: #f4f4f4; padding: 5px 10px; display: inline-block; border-radius: 3px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚀 ${APP_NAME}</h1>
              <p>Admin Account Created</p>
            </div>
            <div class="content">
              <h2>Welcome, Administrator! 👋</h2>
              <p>Your admin account has been successfully created. Below are your login credentials:</p>
              
              <div class="credentials">
                <div class="credential-item">
                  <span class="credential-label">Email:</span><br/>
                  <span class="credential-value">${email}</span>
                </div>
                <div class="credential-item">
                  <span class="credential-label">Temporary Password:</span><br/>
                  <span class="credential-value">${temporaryPassword}</span>
                </div>
              </div>

              <div class="warning">
                <strong>⚠️ Important Security Notice:</strong><br/>
                This is a temporary password. Please log in and change it immediately for security purposes.
              </div>

              <p>You can log in to your account using the button below:</p>
              <a href="${APP_URL}/auth/signin" class="button">Login to Dashboard</a>

              <p style="margin-top: 30px;">
                <strong>As an administrator, you can:</strong>
              </p>
              <ul>
                <li>Manage all users and projects</li>
                <li>Access admin panel features</li>
                <li>Delete users and their associated data</li>
                <li>Toggle user roles between user and admin</li>
              </ul>

              <div class="footer">
                <p>This is an automated email from ${APP_NAME}.</p>
                <p>If you didn't request this account, please ignore this email.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      ${APP_NAME} - Admin Credentials
      
      Welcome, Administrator!
      
      Your admin account has been successfully created.
      
      Login Credentials:
      - Email: ${email}
      - Temporary Password: ${temporaryPassword}
      
      IMPORTANT: This is a temporary password. Please log in and change it immediately.
      
      Login URL: ${APP_URL}/auth/signin
      
      As an administrator, you can manage all users and projects through the admin panel.
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Admin credentials email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send admin credentials email:', error);
    return { success: false, error };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetUrl = `${APP_URL}/auth/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"${APP_NAME}" <${FROM_EMAIL}>`,
    to: email,
    subject: `${APP_NAME} - Password Reset Request`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 ${APP_NAME}</h1>
              <p>Password Reset Request</p>
            </div>
            <div class="content">
              <h2>Reset Your Password</h2>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              
              <a href="${resetUrl}" class="button">Reset Password</a>

              <div class="warning">
                <strong>⚠️ Security Notice:</strong><br/>
                This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
              </div>

              <p style="margin-top: 20px; font-size: 12px; color: #666;">
                If the button doesn't work, copy and paste this URL into your browser:<br/>
                <code style="background: #f4f4f4; padding: 5px; display: block; margin-top: 10px; word-break: break-all;">${resetUrl}</code>
              </p>

              <div class="footer">
                <p>This is an automated email from ${APP_NAME}.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      ${APP_NAME} - Password Reset Request
      
      We received a request to reset your password.
      
      Click the link below to reset your password:
      ${resetUrl}
      
      This link will expire in 1 hour.
      
      If you didn't request a password reset, please ignore this email.
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return { success: false, error };
  }
}

/**
 * Send welcome email for new user signup
 */
export async function sendWelcomeEmail(email: string, firstName?: string) {
  const name = firstName || email.split('@')[0];
  
  const mailOptions = {
    from: `"${APP_NAME}" <${FROM_EMAIL}>`,
    to: email,
    subject: `Welcome to ${APP_NAME}! 🎉`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .features { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .feature-item { margin: 15px 0; padding-left: 30px; position: relative; }
            .feature-item::before { content: "✓"; position: absolute; left: 0; color: #667eea; font-weight: bold; font-size: 20px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚀 ${APP_NAME}</h1>
              <p>Welcome Aboard!</p>
            </div>
            <div class="content">
              <h2>Hi ${name}! 👋</h2>
              <p>Thank you for signing up with ${APP_NAME}. We're excited to have you on board!</p>
              
              <div class="features">
                <h3>What you can do:</h3>
                <div class="feature-item">Create unlimited mock REST APIs</div>
                <div class="feature-item">Generate realistic test data with Faker.js</div>
                <div class="feature-item">Define custom resources with relations</div>
                <div class="feature-item">Use advanced querying, sorting, and pagination</div>
                <div class="feature-item">Collaborate with team members on projects</div>
              </div>

              <a href="${APP_URL}" class="button">Get Started</a>

              <p style="margin-top: 30px;">
                If you have any questions or need help, feel free to reach out to our support team.
              </p>

              <div class="footer">
                <p>Happy API building! 🎨</p>
                <p>The ${APP_NAME} Team</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Welcome to ${APP_NAME}!
      
      Hi ${name},
      
      Thank you for signing up! We're excited to have you on board.
      
      With ${APP_NAME}, you can:
      - Create unlimited mock REST APIs
      - Generate realistic test data
      - Define custom resources with relations
      - Use advanced querying and filtering
      - Collaborate with team members
      
      Get started: ${APP_URL}
      
      Happy API building!
      The ${APP_NAME} Team
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return { success: false, error };
  }
}

/**
 * Verify email configuration
 */
export async function verifyEmailConfig() {
  try {
    await transporter.verify();
    console.log('✅ Email service is ready');
    return true;
  } catch (error) {
    console.error('❌ Email service configuration error:', error);
    return false;
  }
}
