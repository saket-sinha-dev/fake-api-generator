import { BaseRepository } from './BaseRepository';
import { UserProfile, IUserProfile } from '@/models';

/**
 * User repository
 * Handles data access for UserProfile entities
 */
export class UserRepository extends BaseRepository<IUserProfile> {
  constructor() {
    super(UserProfile, 'UserProfile');
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<IUserProfile | null> {
    await this.ensureConnection();
    return this.findOne({ email });
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    await this.ensureConnection();
    return this.exists({ email });
  }

  /**
   * Find user by reset token
   */
  async findByResetToken(token: string): Promise<IUserProfile | null> {
    await this.ensureConnection();
    
    return this.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });
  }

  /**
   * Update user password
   */
  async updatePassword(email: string, hashedPassword: string): Promise<IUserProfile | null> {
    await this.ensureConnection();
    
    const result = await UserProfile.findOneAndUpdate(
      { email },
      { 
        password: hashedPassword,
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined
      },
      { new: true }
    ).lean();
    
    return result as IUserProfile | null;
  }

  /**
   * Set password reset token
   */
  async setResetToken(email: string, token: string, expires: Date): Promise<IUserProfile | null> {
    await this.ensureConnection();
    
    const result = await UserProfile.findOneAndUpdate(
      { email },
      { 
        resetPasswordToken: token,
        resetPasswordExpires: expires
      },
      { new: true }
    ).lean();
    
    return result as IUserProfile | null;
  }

  /**
   * Find all users (admin only)
   */
  async findAllUsers(): Promise<IUserProfile[]> {
    await this.ensureConnection();
    return this.find({});
  }

  /**
   * Update user role
   */
  async updateRole(email: string, role: 'user' | 'admin'): Promise<IUserProfile | null> {
    await this.ensureConnection();
    
    const result = await UserProfile.findOneAndUpdate(
      { email },
      { role },
      { new: true }
    ).lean();
    
    return result as IUserProfile | null;
  }
}
