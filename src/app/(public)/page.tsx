import { getProfessionals } from "./_data-access/get-professionals";
import { Professionals } from "./_components/professionals";
import { Header } from "./_components/header";

export const dynamic = "force-dynamic";

export default async function PublicPage() {
  const professionals = await getProfessionals();

  return (
    <>
      <Header />
      <main className="px-4 py-6">
        <h1 className="text-center text-2xl md:text-3xl font-semibold mb-6">
          Clínicas disponíveis
        </h1>

        <section className="max-w-6xl mx-auto">
          <Professionals professionals={professionals} />
        </section>
      </main>
    </>
  );
}
