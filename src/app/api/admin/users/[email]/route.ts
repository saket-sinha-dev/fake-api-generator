import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import { UserProfile, Project, Resource, API, Database } from '@/models';

// Helper function to check if user is admin
async function isAdmin(email: string): Promise<boolean> {
  const profile = await UserProfile.findOne({ email }).lean();
  return profile?.role === 'admin';
}

// DELETE /api/admin/users/[email] - Delete user and all their projects (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ email: string }> }
) {
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

    const { email } = await params;

    // Prevent admin from deleting themselves
    if (email === session.user.email) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    // Find user to delete
    const userToDelete = await UserProfile.findOne({ email });
    if (!userToDelete) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find all projects owned by this user
    const userProjects = await Project.find({ userId: email }).lean();
    const projectIds = userProjects.map(p => p.id);

    // Delete all resources associated with these projects
    const deletedResources = await Resource.deleteMany({ projectId: { $in: projectIds } });

    // Delete all APIs associated with these projects
    const deletedApis = await API.deleteMany({ projectId: { $in: projectIds } });

    // Get all resource names for this user's projects to delete generated data
    const resources = await Resource.find({ projectId: { $in: projectIds } }).lean();
    const resourceNames = resources.map(r => r.name);
    const deletedDatabases = await Database.deleteMany({ resourceName: { $in: resourceNames } });

    // Delete all projects owned by this user
    const deletedProjects = await Project.deleteMany({ userId: email });

    // Remove user from collaborators in other projects
    await Project.updateMany(
      { collaborators: email },
      { $pull: { collaborators: email } }
    );

    // Finally, delete the user profile
    await UserProfile.deleteOne({ email });

    return NextResponse.json({
      success: true,
      message: `User ${email} and all associated data deleted`,
      deletedCounts: {
        projects: deletedProjects.deletedCount,
        resources: deletedResources.deletedCount,
        apis: deletedApis.deletedCount,
        databases: deletedDatabases.deletedCount,
      },
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/admin/users/[email] - Update user role (admin only)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ email: string }> }
) {
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

    const { email } = await params;
    const { role } = await request.json();

    if (!role || !['user', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role. Must be "user" or "admin"' }, { status: 400 });
    }

    // Prevent admin from demoting themselves
    if (email === session.user.email && role === 'user') {
      return NextResponse.json({ error: 'Cannot demote your own account' }, { status: 400 });
    }

    const updatedUser = await UserProfile.findOneAndUpdate(
      { email },
      { role },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
