import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // Force state-only check to bypass PKCE cookie issues on Vercel
      checks: ["state"],
    }),
  ],
  // Ensure cookies are shared across subdomains if necessary
  cookies: {
    pkceCodeVerifier: {
      name: "next-auth.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: {
    signIn: "/login",
  },
  events: {
    async createUser({ user }) {
      try {
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
        }
      } catch (error) {
        console.error("Error in createUser event:", error);
        // Do not throw, so the user can still sign in even if credits fail initially
      }
    }
  },
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        // @ts-expect-error -- credits is a custom field on User
        session.user.credits = user.credits;
        session.user.id = user.id;
      }
      return session;
    },
  },
});
