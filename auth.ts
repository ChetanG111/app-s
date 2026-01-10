import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // Only check state to avoid PKCE cookie parsing issues on some environments
      checks: ["state"],
    }),
  ],
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
      }
    }
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        // Fetch credits from DB since we're using JWT strategy
        const user = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { credits: true }
        });
        if (user) {
          // @ts-expect-error -- credits is a custom field on User
          session.user.credits = user.credits;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    }
  },
});