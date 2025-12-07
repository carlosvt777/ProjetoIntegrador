"use server";

import { signIn } from "@/lib/auth";

type LoginType = "google" | "github";

export async function handleRegister(input: FormData | LoginType) {
  let provider: LoginType;

  // Caso seja chamado via <form action={handleRegister}>
  if (input instanceof FormData) {
    provider = input.get("provider") as LoginType;
  } else {
    // Caso seja chamado como handleRegister("google")
    provider = input as LoginType;
  }

  await signIn(provider, { redirectTo: "/dashboard" });
}
