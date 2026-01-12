// auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { LoginSchema } from "@/lib/validations/auth";
import bcrypt from "bcryptjs";

class CustomAuthError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'CustomAuthError';
    this.code = code;
  }
}

// Credentials Provider definition (Node.js only due to bcrypt)
const credentialsProvider = Credentials({
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
});

// authConfig used by middleware (Edge-compatible) - does NOT include Credentials provider
export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      checks: ["state"],
    }),
  ],
  pages: {
    signIn: "/login",
  },
  events: {
    async createUser({ user }: any) {
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
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.credits = user.credits;
      }
      return token;
    },
    session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.credits = token.credits;
      }
      return session;
    },
  },
} as any;

// Full Auth.js handler configuration (Node.js only) - combines authConfig with Credentials provider
export const { handlers, signIn, signOut, auth } = (NextAuth as any)({
  ...authConfig,
  providers: [...authConfig.providers, credentialsProvider], // Add credentials provider here
  adapter: PrismaAdapter(prisma),
});
