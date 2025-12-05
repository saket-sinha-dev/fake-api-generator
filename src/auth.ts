import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import connectDB from "@/lib/mongodb"
import { UserProfile as UserProfileModel } from "@/models"

export const { handlers, signIn, signOut, auth } = NextAuth({
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    trustHost: true,
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required");
                }

                await connectDB();

                // Find user by email
                const user = await UserProfileModel.findOne({ 
                    email: (credentials.email as string).toLowerCase() 
                });

                if (!user) {
                    throw new Error("Invalid email or password");
                }

                // Check if user has a password (not OAuth-only)
                if (!user.password) {
                    throw new Error("Please sign in with Google");
                }

                // Verify password
                const isValidPassword = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (!isValidPassword) {
                    throw new Error("Invalid email or password");
                }

                // Return user object
                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email,
                    image: null,
                };
            }
        })
    ],
    pages: {
        signIn: '/auth/signin',
    },
    callbacks: {
        authorized: async ({ auth }) => {
            // Logged in users are authenticated, otherwise redirect to login page
            return !!auth
        },
        async signIn({ user, account, profile }) {
            // For Google OAuth, save user to MongoDB
            if (account?.provider === "google") {
                await connectDB();
                
                const existingUser = await UserProfileModel.findOne({ 
                    email: user.email?.toLowerCase() 
                });

                if (!existingUser && user.email) {
                    // Extract first and last name from profile or user.name
                    let firstName = "";
                    let lastName = "";
                    
                    if (profile?.name) {
                        const nameParts = (profile.name as string).split(" ");
                        firstName = nameParts[0] || "";
                        lastName = nameParts.slice(1).join(" ") || "";
                    } else if (user.name) {
                        const nameParts = user.name.split(" ");
                        firstName = nameParts[0] || "";
                        lastName = nameParts.slice(1).join(" ") || "";
                    }

                    await UserProfileModel.create({
                        email: user.email.toLowerCase(),
                        firstName,
                        lastName,
                        role: 'user',
                        isEmailVerified: true, // Google OAuth emails are verified
                    });
                }
            }
            
            return true;
        },
        async session({ session, token }) {
            // Add user data to session
            if (session.user && token.email) {
                await connectDB();
                const user = await UserProfileModel.findOne({ 
                    email: token.email.toLowerCase() 
                });
                
                if (user) {
                    (session.user as any).role = user.role || 'user';
                    (session.user as any).firstName = user.firstName;
                    (session.user as any).lastName = user.lastName;
                }
            }
            return session;
        },
    },
    session: {
        strategy: "jwt", // Use JWT for session management
    },
})
