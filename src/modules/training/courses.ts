import type { TrainingCourse } from "@/types";

export const TRAINING_COURSES: TrainingCourse[] = [
  {
    id: "lideranca_basica",
    name: "Liderança Básica",
    description: "Curso introdutório sobre gestão de equipes e comunicação operacional.",
    durationCycles: 2,
    cost: 500,
    effect: { attribute: "trainingLevel", amount: 1 },
  },
  {
    id: "gestao_de_crises",
    name: "Gestão de Crises",
    description: "Treinamento de tomada de decisão sob pressão em cenários simulados.",
    durationCycles: 3,
    cost: 900,
    effect: { attribute: "trainingLevel", amount: 2 },
  },
  {
    id: "recuperacao_operacional",
    name: "Recuperação Operacional",
    description: "Programa de descanso e recondicionamento para reduzir fadiga da equipe.",
    durationCycles: 1,
    cost: 300,
    effect: { attribute: "fatigueRecovery", amount: 25 },
  },
];
