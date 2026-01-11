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
      checks: ["state"],
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

        // Send Slack Notification
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
