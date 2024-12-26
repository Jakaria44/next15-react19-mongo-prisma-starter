import { db } from "@/db";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth, { AuthError } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getRecentAttempts, trackAuthAttempt } from "./lib/auth-tracking";

export const {
  handlers: { GET, POST },
  signIn,
  signOut,
  auth,
} = NextAuth({
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hour
    updateAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/signin",
    error: "/auth/error",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "email@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials, req) => {
        if (!credentials?.email || !credentials?.password) {
          throw new AuthError("Missing credentials");
        }

        const email = credentials.email.toString().toLowerCase();

        try {
          const recentAttempts = await getRecentAttempts(email);
          if (recentAttempts.length >= 5) {
            const oldestAttempt = recentAttempts[recentAttempts.length - 1];
            const timeSinceFirstAttempt =
              Date.now() - oldestAttempt.createdAt.getTime();

            if (timeSinceFirstAttempt < 30 * 60 * 1000) {
              // 30 minutes
              const waitTime = Math.ceil(
                (30 * 60 * 1000 - timeSinceFirstAttempt) / 1000
              );
              throw new AuthError(
                `Too many attempts. Please try again in ${Math.floor(
                  waitTime / 60
                )}:${waitTime % 60} minutes.`
              );
            }
          }

          const user = await db.user.findUnique({
            where: {
              email,
              // status: UserStatus.APPROVED,
            },
            select: {
              id: true,
              email: true,
              hashedPassword: true,
              name: true,
              image: true,
            },
          });
          if (!user) {
            await trackAuthAttempt({
              email,
              successful: false,
              ipAddress: req?.ip,
              userAgent: req?.headers?.["user-agent"],
            });
            throw new AuthError("Invalid credentials");
          }

          console.log("user found", user);
          // const isValid = await bcrypt.compare(
          //   credentials.password as string,
          //   user.hashedPassword
          // );
          console.log("password", credentials.password);

          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.hashedPassword
          );
          console.log("isValid", isValid);
          if (!isValid) {
            await trackAuthAttempt({
              email,
              userId: user.id,
              successful: false,
              ipAddress: req?.ip,
              userAgent: req?.headers?.["user-agent"],
            });
            throw new AuthError("Invalid credentials");
          }

          await trackAuthAttempt({
            email,
            userId: user.id,
            successful: true,
            ipAddress: req?.ip,
            userAgent: req?.headers?.["user-agent"],
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          console.log("error", error);
          if (error instanceof AuthError) {
            throw error;
          }
          throw new AuthError("An unexpected error occurred");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        token.userId = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        token.exp = Math.floor(Date.now() / 1000) + 60 * 60;
      }

      if (Date.now() >= (token.exp as number) * 1000) {
        return null;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
      }
      return session;
    },
  },
});
