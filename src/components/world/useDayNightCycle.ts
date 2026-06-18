"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";

export type DayPhase = "amanhecer" | "dia" | "poente" | "noite";

export interface DayNightState {
  sunPosition: [number, number, number];
  sunIntensity: number;
  ambientIntensity: number;
  skyColor: THREE.Color;
  phase: DayPhase;
  streetlightsOn: boolean;
}

const CYCLE_SECONDS = 240; // 1 dia completo a cada 4 minutos de jogo

const PHASE_SKY: Record<DayPhase, string> = {
  amanhecer: "#e9985a",
  dia: "#86c5e8",
  poente: "#b3592f",
  noite: "#0a0e1c",
};

function phaseForT(t: number): DayPhase {
  if (t < 0.2) return "dia";
  if (t < 0.3) return "poente";
  if (t < 0.7) return "noite";
  if (t < 0.8) return "amanhecer";
  return "dia";
}

/** Ciclo determinístico de amanhecer/dia/pôr do sol/noite, sincronizado ao relógio do canvas. */
export function useDayNightCycle(): DayNightState {
  const [state, setState] = useState<DayNightState>({
    sunPosition: [10, 8, 4],
    sunIntensity: 1,
    ambientIntensity: 0.7,
    skyColor: new THREE.Color(PHASE_SKY.dia),
    phase: "dia",
    streetlightsOn: false,
  });
  const accumulatedRef = useRef(0);

  useFrame(({ clock }, delta) => {
    accumulatedRef.current += delta;
    if (accumulatedRef.current < 0.3) return;
    accumulatedRef.current = 0;

    const t = (clock.getElapsedTime() % CYCLE_SECONDS) / CYCLE_SECONDS;
    const angle = t * Math.PI * 2 + Math.PI / 2;
    const sunHeight = Math.sin(angle);
    const phase = phaseForT(t);

    setState({
      sunPosition: [Math.cos(angle) * 14, Math.max(1, sunHeight * 14), Math.sin(angle) * 14],
      sunIntensity: Math.max(0.05, sunHeight) * 1.4 + 0.1,
      ambientIntensity: 0.25 + Math.max(0, sunHeight) * 0.6,
      skyColor: new THREE.Color(PHASE_SKY[phase]),
      phase,
      streetlightsOn: sunHeight < 0.15,
    });
  });

  return state;
}
