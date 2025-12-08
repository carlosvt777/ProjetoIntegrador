// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
// imports dos providers que você já usa
// import GoogleProvider from "next-auth/providers/google"
// import etc...

const authOptions: NextAuthOptions = {
  // 👇 mantém aqui TUDO o que já tinha (providers, callbacks, pages, etc.)
  // NADA disso muda, só tiramos o "export"
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
