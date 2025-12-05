import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import { UserProfile, Project, Resource, API, Database } from '@/models';

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

// DELETE /api/profile - Delete current user's account and all associated data
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = session.user.email;
    await connectDB();

    // Delete user profile
    await UserProfile.deleteOne({ email: userEmail });

    // Delete all projects owned by the user
    const ownedProjects = await Project.find({ userId: userEmail }).lean();
    const ownedProjectIds = ownedProjects.map(p => p.id);
    
    // Delete resources associated with owned projects
    await Resource.deleteMany({ projectId: { $in: ownedProjectIds } });
    
    // Delete APIs associated with owned projects
    await API.deleteMany({ projectId: { $in: ownedProjectIds } });
    
    // Delete generated data for resources in owned projects
    const ownedResources = await Resource.find({ projectId: { $in: ownedProjectIds } }).lean();
    const resourceNames = ownedResources.map(r => r.name);
    await Database.deleteMany({ resourceName: { $in: resourceNames } });
    
    // Delete the projects themselves
    await Project.deleteMany({ userId: userEmail });

    // Remove user as collaborator from other projects
    await Project.updateMany(
      { collaborators: userEmail },
      { $pull: { collaborators: userEmail } }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Account and all associated data deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
