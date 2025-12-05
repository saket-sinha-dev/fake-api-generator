import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import { UserProfile as UserProfileModel } from '@/models';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find user
    const user = await UserProfileModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if user exists for security
      return NextResponse.json(
        { message: 'If an account exists with this email, a password reset link has been sent.' },
        { status: 200 }
      );
    }

    // Check if user has a password (not OAuth-only)
    if (!user.password) {
      return NextResponse.json(
        { error: 'This account uses social login. Please sign in with Google.' },
        { status: 400 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set token and expiry (1 hour)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send email (non-blocking)
    sendPasswordResetEmail(email, resetToken).catch(err =>
      console.error('Failed to send password reset email:', err)
    );

    return NextResponse.json(
      { message: 'If an account exists with this email, a password reset link has been sent.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process request. Please try again.' },
      { status: 500 }
    );
  }
}
