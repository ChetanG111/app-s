// auth.ts
import NextAuth from "next-auth"; // Removed CredentialsSignin for now to simplify
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { LoginSchema } from "@/lib/validations/auth";
import bcrypt from "bcryptjs";
import type { NextAuthConfig } from "next-auth";

class CustomAuthError extends Error { // Changed to extend Error directly for now
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'CustomAuthError';
    this.code = code; // Auth.js uses code for the error key
  }
}

// NOTE: This authConfig does NOT include the adapter, so it can be used in Edge environments.
export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" }, // Explicitly set JWT strategy
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      checks: ["state"],
    }),
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);

        if (!validatedFields.success) {
          throw new CustomAuthError("Invalid email or password format.", "invalid-format");
        }

        const { email, password } = validatedFields.data;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          throw new CustomAuthError("No account found with this email.", "user-not-found");
        }

        if (!user.password) {
          throw new CustomAuthError("This account uses Google login. Please sign in with Google.", "no-password-set");
        }

        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (!passwordsMatch) {
          throw new CustomAuthError("The password you entered is incorrect.", "incorrect-password");
        }

        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  events: {
    async createUser({ user }) {
      if (user.id) {
        await prisma.creditTransaction.create({
          data: {
            userId: user.id,
            amount: 3,
            type: "WELCOME_BONUS",
            status: "COMPLETED",
            metadata: { message: "3 free credits for new account" }
          }
        });

        const { sendSlackNotification } = await import("@/lib/slack");
        await sendSlackNotification(`👋 New User Signup`, {
          Name: user.name || "Unknown",
          Email: user.email || "No email",
          Id: user.id
        });
      }
    }
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // @ts-expect-error -- credits is a custom field on User
        token.credits = user.credits;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        // @ts-expect-error -- credits is a custom field on User
        session.user.credits = token.credits;
      }
      return session;
    },
  },
} satisfies NextAuthConfig; // Use 'satisfies' for better type inference

// This is the Auth.js handler configuration, which includes the Prisma Adapter.
// It will only be used in Node.js environments (like API routes).
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma), // Adapter is added here, not in authConfig directly
});
