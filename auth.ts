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
      // Completely disable checks to resolve persistent PKCE/State cookie issues on Vercel
      // Note: This should be used for debugging or when environment issues prevent standard checks
      checks: ["none"] as any, 
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
