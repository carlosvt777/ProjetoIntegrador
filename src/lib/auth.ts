import NextAuth from "next-auth"
import prisma from "./prisma"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { Adapter } from "next-auth/adapters"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  trustHost: true,
  debug: true,
  logger: {
    error(code, metadata) {
      console.error("[AUTH ERROR]", code, metadata)
    },
  },
  providers: [
    GitHub,
    Google,
  ],
})
