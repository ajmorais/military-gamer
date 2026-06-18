"use client";

interface TitleScreenProps {
  onStart: () => void;
  onContinue?: () => void;
  hasSave: boolean;
}

export function TitleScreen({ onStart, onContinue, hasSave }: TitleScreenProps) {
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-zinc-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(52,211,153,0.15),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_70%_80%,rgba(250,204,21,0.08),transparent_50%)]" />
      <h1 className="z-10 text-4xl font-bold tracking-tight md:text-6xl">SERTÃO OPERAÇÕES</h1>
      <p className="z-10 mt-2 text-sm text-zinc-400 md:text-base">
        Força de Segurança Territorial do Sertão (FSTS) · Estado fictício de Nova Aratanha
      </p>
      <div className="z-10 mt-10 flex gap-3">
        {hasSave && (
          <button
            onClick={onContinue}
            className="rounded bg-zinc-700 px-6 py-3 text-sm font-semibold uppercase tracking-wide hover:bg-zinc-600"
          >
            Continuar carreira
          </button>
        )}
        <button
          onClick={onStart}
          className="rounded bg-emerald-600 px-6 py-3 text-sm font-semibold uppercase tracking-wide hover:bg-emerald-500"
        >
          {hasSave ? "Nova carreira" : "Iniciar carreira"}
        </button>
      </div>
      <p className="z-10 mt-6 max-w-md text-center text-[11px] text-zinc-500">
        Esta obra é inteiramente fictícia. Qualquer semelhança com instituições, organizações ou pessoas reais é
        mera coincidência. O jogo não possui vínculo, autorização ou representação oficial de qualquer órgão
        público.
      </p>
    </div>
  );
}
