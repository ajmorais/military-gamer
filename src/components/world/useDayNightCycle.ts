"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";

export type DayPhase = "amanhecer" | "dia" | "poente" | "noite";

export interface DayNightState {
  sunPosition: [number, number, number];
  sunIntensity: number;
  /** Cor da luz solar — quente no horizonte, neutra ao meio-dia, azulada à noite (lua). */
  sunColor: THREE.Color;
  ambientIntensity: number;
  skyColor: THREE.Color;
  fogColor: THREE.Color;
  fogNear: number;
  fogFar: number;
  phase: DayPhase;
  streetlightsOn: boolean;
  /** 0 = dia pleno, 1 = noite fechada. Usado para estrelas e janelas acesas. */
  nightFactor: number;
}

const CYCLE_SECONDS = 240; // 1 dia completo a cada 4 minutos de jogo

const SKY_NIGHT = new THREE.Color("#0a0e1c");
const SKY_HORIZON = new THREE.Color("#e08a4e");
const SKY_DAY = new THREE.Color("#86c5e8");
const SUN_NOON = new THREE.Color("#fff4e0");
const SUN_HORIZON = new THREE.Color("#ff9a4a");
const MOONLIGHT = new THREE.Color("#5a6f9e");

function phaseForT(t: number): DayPhase {
  if (t < 0.2) return "dia";
  if (t < 0.3) return "poente";
  if (t < 0.7) return "noite";
  if (t < 0.8) return "amanhecer";
  return "dia";
}

/** Ciclo contínuo de amanhecer/dia/pôr do sol/noite, com cores interpoladas suavemente. */
export function useDayNightCycle(): DayNightState {
  const [state, setState] = useState<DayNightState>(() => ({
    sunPosition: [10, 8, 4],
    sunIntensity: 1.6,
    sunColor: SUN_NOON.clone(),
    ambientIntensity: 0.5,
    skyColor: SKY_DAY.clone(),
    fogColor: SKY_DAY.clone().lerp(new THREE.Color("#ffffff"), 0.15),
    fogNear: 18,
    fogFar: 70,
    phase: "dia",
    streetlightsOn: false,
    nightFactor: 0,
  }));
  const accumulatedRef = useRef(0);

  useFrame(({ clock }, delta) => {
    accumulatedRef.current += delta;
    if (accumulatedRef.current < 0.2) return;
    accumulatedRef.current = 0;

    const t = (clock.getElapsedTime() % CYCLE_SECONDS) / CYCLE_SECONDS;
    const angle = t * Math.PI * 2 + Math.PI / 2;
    const sunHeight = Math.sin(angle); // -1 (meia-noite) .. 1 (meio-dia)
    const phase = phaseForT(t);

    // 0 = noite, 1 = dia, com crepúsculo suave em torno do horizonte
    const daylight = THREE.MathUtils.smoothstep(sunHeight, -0.12, 0.25);
    const nightFactor = 1 - daylight;
    // proximidade do horizonte (dourado do amanhecer/poente)
    const horizonGlow = Math.max(0, 1 - Math.abs(sunHeight) * 3.2) * daylight;

    const skyColor = SKY_NIGHT.clone().lerp(SKY_DAY, daylight).lerp(SKY_HORIZON, horizonGlow * 0.55);
    const sunColor = SUN_NOON.clone().lerp(SUN_HORIZON, Math.min(1, horizonGlow * 1.4));
    if (daylight < 0.02) sunColor.copy(MOONLIGHT);

    setState({
      sunPosition: [Math.cos(angle) * 40, Math.max(2, sunHeight * 40), Math.sin(angle) * 40],
      sunIntensity: 0.18 + daylight * 2.2,
      sunColor,
      ambientIntensity: 0.16 + daylight * 0.65,
      skyColor,
      fogColor: skyColor.clone().lerp(new THREE.Color("#ffffff"), daylight * 0.12),
      fogNear: 14 + daylight * 8,
      fogFar: 46 + daylight * 34,
      phase,
      streetlightsOn: sunHeight < 0.15,
      nightFactor,
    });
  });

  return state;
}
