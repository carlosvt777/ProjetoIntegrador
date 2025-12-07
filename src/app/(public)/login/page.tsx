"use client";

import { handleRegister } from "../_actions/login";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-6 bg-white shadow rounded-xl w-full max-w-sm">
        <h1 className="text-xl font-semibold mb-4 text-center">Entrar</h1>

        <form action={handleRegister} className="flex flex-col gap-3">
          <button
            type="submit"
            name="provider"
            value="google"
            className="py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
          >
            Entrar com Google
          </button>

          <button
            type="submit"
            name="provider"
            value="github"
            className="py-2 rounded bg-gray-800 text-white hover:bg-gray-900"
          >
            Entrar com GitHub
          </button>
        </form>
      </div>
    </main>
  );
}
