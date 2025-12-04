import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { auth } from '@/auth';
import { UserProfile } from '@/types';

const dbPath = path.join(process.cwd(), 'data', 'database.json');

async function readDB() {
  const data = await fs.readFile(dbPath, 'utf-8');
  return JSON.parse(data);
}

async function writeDB(data: any) {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
}

// GET /api/profile - Get current user's profile
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await readDB();
    const profile = db.userProfiles?.find(
      (p: UserProfile) => p.email === session.user!.email
    );

    if (!profile) {
      // Return default profile with session data
      return NextResponse.json({
        email: session.user.email,
        name: session.user.name || '',
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
    const { name, mobile } = body;

    const db = await readDB();
    if (!db.userProfiles) {
      db.userProfiles = [];
    }

    const existingIndex = db.userProfiles.findIndex(
      (p: UserProfile) => p.email === session.user!.email
    );

    const updatedProfile: UserProfile = {
      email: session.user!.email,
      name: name || '',
      mobile: mobile || '',
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      db.userProfiles[existingIndex] = updatedProfile;
    } else {
      db.userProfiles.push(updatedProfile);
    }

    await writeDB(db);

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
