import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
// ...

export const authOptions = {
  // ... (deixa exatamente como já está aí dentro)
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
