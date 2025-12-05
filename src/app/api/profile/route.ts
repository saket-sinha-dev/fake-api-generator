import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import { UserProfile } from '@/models';

// GET /api/profile - Get current user's profile
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const profile = await UserProfile.findOne({ email: session.user.email }).lean();

    if (!profile) {
      // Return default profile with session data
      const fullName = session.user.name || '';
      const nameParts = fullName.split(' ');
      return NextResponse.json({
        email: session.user.email,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        mobile: '',
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

// PUT /api/profile - Update current user's profile
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { firstName, lastName, mobile } = body;

    await connectDB();

    const updatedProfile = await UserProfile.findOneAndUpdate(
      { email: session.user.email },
      {
        email: session.user.email,
        firstName: firstName || '',
        lastName: lastName || '',
        mobile: mobile || '',
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
