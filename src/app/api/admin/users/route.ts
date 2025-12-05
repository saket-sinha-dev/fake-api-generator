import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import { UserProfile, Project, Resource, API, Database } from '@/models';

// Helper function to check if user is admin
async function isAdmin(email: string): Promise<boolean> {
  const profile = await UserProfile.findOne({ email }).lean();
  return profile?.role === 'admin';
}

// GET /api/admin/users - List all users (admin only)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Check if user is admin
    if (!await isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const users = await UserProfile.find().select('-__v').lean();
    
    // Get project counts for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const projectCount = await Project.countDocuments({ userId: user.email });
        const collaboratingCount = await Project.countDocuments({ collaborators: user.email });
        return {
          ...user,
          projectCount,
          collaboratingCount,
        };
      })
    );

    return NextResponse.json(usersWithStats);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
