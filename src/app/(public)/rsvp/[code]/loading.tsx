import { pageWidth, publicHeading, sectionIntro, sectionSpace } from "@/components/ui/styles";

export default function LoadingRsvpPage() {
  return (
    <main className={`bg-soft-lilac text-center ${sectionSpace}`} id="conteudo">
      <div className={`${pageWidth} max-w-190`}>
        <h1 className={publicHeading}>Preparando sua confirmação</h1>
        <p className={sectionIntro} role="status">Carregando os dados do convite...</p>
      </div>
    </main>
  );
}
