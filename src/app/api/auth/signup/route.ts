import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import { UserProfile as UserProfileModel } from '@/models';
import { sendWelcomeEmail } from '@/lib/email';
import { 
  createdResponse, 
  badRequestResponse, 
  conflictResponse,
  handleApiError 
} from '@/lib/apiResponse';
import { 
  validateEmail, 
  validatePassword, 
  validateRequiredFields,
  sanitizeString 
} from '@/lib/validation';
import { logger } from '@/lib/logger';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, USER_ROLES } from '@/lib/constants';

export async function POST(request: Request) {
  try {
    logger.logRequest('POST', '/api/auth/signup');
    
    const body = await request.json();
    const { email, password, firstName, lastName, mobile } = body;

    // Validate required fields
    const validation = validateRequiredFields(body, ['email', 'password']);
    if (!validation.valid) {
      logger.logValidationError('required_fields', validation.error || '');
      return badRequestResponse(ERROR_MESSAGES.EMAIL_PASSWORD_REQUIRED);
    }

    // Validate email format
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      logger.logValidationError('email', emailValidation.error || '');
      return badRequestResponse(emailValidation.error);
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      logger.logValidationError('password', passwordValidation.error || '');
      return badRequestResponse(passwordValidation.error);
    }

    // Sanitize inputs
    const sanitizedEmail = email.toLowerCase().trim();
    const sanitizedFirstName = firstName ? sanitizeString(firstName, 50) : undefined;
    const sanitizedLastName = lastName ? sanitizeString(lastName, 50) : undefined;
    const sanitizedMobile = mobile ? sanitizeString(mobile, 20) : undefined;

    await connectDB();

    // Check if user already exists
    const existingUser = await UserProfileModel.findOne({ email: sanitizedEmail });
    if (existingUser) {
      logger.warn('Signup attempted with existing email', { email: sanitizedEmail });
      return conflictResponse('User with this email already exists');
    }

    // Hash password with secure cost factor
    const hashedPassword = await bcrypt.hash(password, 12);

        logger.logDbOperation('create', 'userprofiles', { email: sanitizedEmail });

        // Create new user
        const userData: any = {
            email: sanitizedEmail,
            password: hashedPassword,
            role: USER_ROLES.USER,
            isEmailVerified: false,
        };
        
        if (sanitizedFirstName) userData.firstName = sanitizedFirstName;
        if (sanitizedLastName) userData.lastName = sanitizedLastName;
        if (sanitizedMobile) userData.mobile = sanitizedMobile;
        
        const newUser = (await UserProfileModel.create(userData)) as any;

        logger.logAuth('signup', sanitizedEmail, true);

    // Send welcome email (non-blocking)
    if (sanitizedFirstName) {
      sendWelcomeEmail(sanitizedEmail, sanitizedFirstName).catch(err => {
        logger.error('Failed to send welcome email', err, { email: sanitizedEmail });
      });
    }

    // Return user data (without password)
    return createdResponse({
      message: SUCCESS_MESSAGES.ACCOUNT_CREATED,
      user: {
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        mobile: newUser.mobile,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    logger.error('Signup error', error);
    return handleApiError(error);
  }
}
