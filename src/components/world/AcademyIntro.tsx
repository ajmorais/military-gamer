"use client";

import { useState } from "react";

interface AcademyIntroProps {
  displayName: string;
  onDone: () => void;
}

export function AcademyIntro({ displayName, onDone }: AcademyIntroProps) {
  const slides = [
    {
      title: "A notícia",
      text: `${displayName} recebe a carta: aprovação confirmada no concurso da Força de Segurança Territorial do Sertão.`,
    },
    {
      title: "A despedida",
      text: "É hora de deixar a vida civil para trás. Família, amigos, rotina antiga — tudo muda a partir de hoje.",
    },
    {
      title: "A chegada",
      text: "Academia de Formação da FSTS, Nova Aratanha. Um instrutor aguarda no pátio para o primeiro dia: Adaptação Militar.",
    },
  ];
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const isLast = index === slides.length - 1;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-white">
      <div className="max-w-lg px-6 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">{slide.title}</p>
        <p className="mt-4 text-lg leading-relaxed text-zinc-200">{slide.text}</p>
      </div>
      <button
        onClick={() => (isLast ? onDone() : setIndex((i) => i + 1))}
        className="mt-10 rounded bg-emerald-600 px-6 py-2 text-sm font-semibold uppercase tracking-wide hover:bg-emerald-500"
      >
        {isLast ? "Entrar na academia" : "Continuar"}
      </button>
    </div>
  );
}
