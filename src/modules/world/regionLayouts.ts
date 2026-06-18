import type { RegionId } from "@/types";

export interface WorldPoint {
  x: number;
  z: number;
}

export interface RegionWorldLayout {
  groundColor: string;
  skyColor: string;
  buildings: WorldPoint[];
  npcs: WorldPoint[];
  vehicleSpawn: WorldPoint;
  missionSpawns: WorldPoint[];
  quartelSpawn: WorldPoint;
  label: string;
}

export const REGION_WORLD_LAYOUTS: Record<RegionId, RegionWorldLayout> = {
  metropolitana: {
    groundColor: "#3a3f44",
    skyColor: "#1b2530",
    buildings: [
      { x: -8, z: -6 }, { x: -4, z: -10 }, { x: 6, z: -8 }, { x: 10, z: -4 },
      { x: -10, z: 4 }, { x: 8, z: 6 }, { x: 2, z: -14 }, { x: -6, z: 10 },
    ],
    npcs: [{ x: -3, z: 2 }, { x: 4, z: -3 }, { x: 1, z: 6 }],
    vehicleSpawn: { x: 4, z: 4 },
    missionSpawns: [{ x: 12, z: 10 }, { x: -16, z: -8 }],
    quartelSpawn: { x: 0, z: -5 },
    label: "Centro Urbano de Santa Aurora",
  },
  serrana: {
    groundColor: "#3f4a3a",
    skyColor: "#2a3326",
    buildings: [{ x: -5, z: -5 }, { x: 5, z: 6 }],
    npcs: [{ x: -2, z: -4 }, { x: 3, z: 5 }],
    vehicleSpawn: { x: -4, z: 2 },
    missionSpawns: [{ x: -14, z: -10 }, { x: 18, z: 6 }],
    quartelSpawn: { x: 0, z: -8 },
    label: "Encostas da Serra do Aratanha",
  },
  costeira: {
    groundColor: "#3a4750",
    skyColor: "#1c2f38",
    buildings: [{ x: -7, z: 3 }, { x: 9, z: -2 }, { x: 3, z: 9 }],
    npcs: [{ x: 0, z: -2 }, { x: 6, z: 4 }],
    vehicleSpawn: { x: 6, z: -6 },
    missionSpawns: [{ x: 16, z: 6 }, { x: -12, z: -14 }],
    quartelSpawn: { x: -2, z: -7 },
    label: "Litoral de Baía Verde",
  },
  rural: {
    groundColor: "#4a4434",
    skyColor: "#332c1f",
    buildings: [{ x: -6, z: -2 }, { x: 8, z: 5 }],
    npcs: [{ x: 2, z: -5 }],
    vehicleSpawn: { x: -2, z: -3 },
    missionSpawns: [{ x: -18, z: 4 }, { x: 14, z: 16 }],
    quartelSpawn: { x: 5, z: -9 },
    label: "Vale Rural do Sertão",
  },
  industrial: {
    groundColor: "#33373d",
    skyColor: "#16191d",
    buildings: [
      { x: -9, z: -6 }, { x: -3, z: -9 }, { x: 5, z: -7 }, { x: 9, z: -2 }, { x: 2, z: 4 },
    ],
    npcs: [{ x: -4, z: 1 }, { x: 4, z: -2 }],
    vehicleSpawn: { x: 0, z: 6 },
    missionSpawns: [{ x: 14, z: -12 }, { x: -16, z: 10 }],
    quartelSpawn: { x: -6, z: -10 },
    label: "Distrito Industrial Norte",
  },
};
