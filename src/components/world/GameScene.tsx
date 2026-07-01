"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Sky, Stars, useAnimations } from "@react-three/drei";
import {
  Bloom,
  BrightnessContrast,
  EffectComposer,
  HueSaturation,
  N8AO,
  SMAA,
  ToneMapping,
  Vignette,
} from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";
import type { RegionId } from "@/types";
import { REGION_WORLD_LAYOUTS } from "@/modules/world/regionLayouts";
import { NPC_ROSTER, type NpcProfile } from "@/modules/npcs/npcRoster";
import { BOSS_ENCOUNTERS, type BossEncounter } from "@/modules/narrative/bosses";
import { CharacterController, type CharacterState, useHumanoidModel } from "./CharacterController";
import { useDayNightCycle, type DayNightState } from "./useDayNightCycle";
import { RoadNetwork } from "./RoadNetwork";
import { getCloudTexture, getFacadeMaps, getGroundTexture } from "./textures";

const VEHICLE_ENTER_RADIUS = 2.2;
const MISSION_TRIGGER_RADIUS = 2.5;
const QUARTEL_ENTER_RADIUS = 2.8;
const NPC_TALK_RADIUS = 2.6;
const BOSS_ENCOUNTER_RADIUS = 2.5;

const DayNightContext = createContext<DayNightState | null>(null);

function useDayNight() {
  const ctx = useContext(DayNightContext);
  if (!ctx) throw new Error("useDayNight deve ser usado dentro de WorldEnvironment");
  return ctx;
}

function SunLight({ cycle }: { cycle: DayNightState }) {
  return (
    <>
      <ambientLight intensity={cycle.ambientIntensity} color={cycle.skyColor} />
      <directionalLight
        castShadow
        position={cycle.sunPosition}
        intensity={cycle.sunIntensity}
        color={cycle.sunColor}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-camera-near={1}
        shadow-camera-far={110}
      />
      <hemisphereLight args={["#bcd6ee", "#4a4234", 0.2 + (1 - cycle.nightFactor) * 0.45]} />
    </>
  );
}

function CloudLayer() {
  const { nightFactor } = useDayNight();
  const groupRef = useRef<THREE.Group>(null);
  const texture = getCloudTexture();
  const clouds = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, i) => {
        const rand = (n: number) => Math.abs(Math.sin(i * 12.9898 + n * 78.233)) % 1;
        return {
          x: (rand(0) - 0.5) * 90,
          y: 22 + rand(1) * 10,
          z: (rand(2) - 0.5) * 90,
          scale: 14 + rand(3) * 16,
          speed: 0.15 + rand(4) * 0.25,
        };
      }),
    []
  );

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((cloud, i) => {
      cloud.position.x += clouds[i].speed * delta;
      if (cloud.position.x > 55) cloud.position.x = -55;
    });
  });

  return (
    <group ref={groupRef}>
      {clouds.map((c, i) => (
        <sprite key={i} position={[c.x, c.y, c.z]} scale={[c.scale, c.scale * 0.45, 1]}>
          <spriteMaterial
            map={texture}
            transparent
            opacity={0.55 * (1 - nightFactor * 0.75)}
            depthWrite={false}
          />
        </sprite>
      ))}
    </group>
  );
}

function StreetLamp({ x, z, lit }: { x: number; z: number; lit: boolean }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 1.7, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.09, 3.4, 10]} />
        <meshStandardMaterial color="#26262a" metalness={0.7} roughness={0.35} />
      </mesh>
      {/* braço da luminária */}
      <mesh position={[0.35, 3.35, 0]} rotation={[0, 0, -0.35]} castShadow>
        <cylinderGeometry args={[0.035, 0.045, 0.9, 8]} />
        <meshStandardMaterial color="#26262a" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[0.72, 3.42, 0]}>
        <boxGeometry args={[0.42, 0.12, 0.2]} />
        <meshStandardMaterial
          color="#3a3a3e"
          emissive="#ffd27a"
          emissiveIntensity={lit ? 3 : 0}
          toneMapped={false}
        />
      </mesh>
      {lit && (
        <pointLight position={[0.72, 3.3, 0]} color="#ffcf87" intensity={12} distance={11} decay={2} castShadow={false} />
      )}
    </group>
  );
}

function WorldEnvironment({
  lampPositions,
  rainy,
  children,
}: {
  lampPositions: { x: number; z: number }[];
  rainy: boolean;
  children: React.ReactNode;
}) {
  const cycle = useDayNightCycle();
  return (
    <DayNightContext.Provider value={cycle}>
      <color attach="background" args={[cycle.skyColor]} />
      <fog
        attach="fog"
        args={[cycle.fogColor, rainy ? cycle.fogNear * 0.7 : cycle.fogNear, rainy ? cycle.fogFar * 0.6 : cycle.fogFar]}
      />
      <Sky
        sunPosition={cycle.sunPosition}
        turbidity={rainy ? 14 : 8}
        rayleigh={cycle.nightFactor > 0.6 ? 0.4 : 2.2}
        mieCoefficient={0.008}
        mieDirectionalG={0.85}
      />
      {cycle.nightFactor > 0.35 && (
        <Stars radius={90} depth={40} count={2400} factor={3.2} saturation={0} fade speed={0.4} />
      )}
      {!rainy && <CloudLayer />}
      <SunLight cycle={cycle} />
      {lampPositions.map((p, i) => (
        <StreetLamp key={i} x={p.x} z={p.z} lit={cycle.streetlightsOn} />
      ))}
      {children}
    </DayNightContext.Provider>
  );
}

const BUILDING_PALETTES = [
  { wall: "#8a8f96", roof: "#3c4148", trim: "#d9c98c" },
  { wall: "#a08871", roof: "#4a3c30", trim: "#e8e4d0" },
  { wall: "#7f948f", roof: "#33403c", trim: "#bcd6cf" },
  { wall: "#968296", roof: "#3f343f", trim: "#e0c8e0" },
];

function Building({ x, z }: { x: number; z: number }) {
  const { nightFactor } = useDayNight();
  const seed = Math.abs(Math.round(x * 7 + z * 13));
  const height = 3 + (seed % 10 / 10) * 8;
  const width = 2.2 + (seed % 4) * 0.5;
  const depth = 2.2 + ((seed >> 2) % 4) * 0.5;
  const palette = BUILDING_PALETTES[seed % BUILDING_PALETTES.length];
  const hasFlatRoof = seed % 3 === 0;
  const facade = getFacadeMaps(palette.wall, palette.trim, seed);
  const windowGlow = Math.min(1, nightFactor * 1.6);

  return (
    <group position={[x, 0, z]}>
      {/* fachadas com janelas nas 4 faces; topo e base lisos */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        {[0, 1, 4, 5].map((face) => (
          <meshStandardMaterial
            key={face}
            attach={`material-${face}`}
            map={facade.map}
            emissiveMap={facade.emissiveMap}
            emissive="#ffca7a"
            emissiveIntensity={windowGlow * 1.6}
            roughness={0.85}
            metalness={0.02}
          />
        ))}
        <meshStandardMaterial attach="material-2" color={palette.roof} roughness={0.92} />
        <meshStandardMaterial attach="material-3" color={palette.wall} roughness={0.9} />
      </mesh>
      {/* base/térreo em concreto */}
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[width * 1.06, 0.7, depth * 1.06]} />
        <meshStandardMaterial color="#5b5b58" roughness={0.9} />
      </mesh>
      {hasFlatRoof ? (
        <group>
          <mesh position={[0, height + 0.15, 0]} castShadow>
            <boxGeometry args={[width * 1.05, 0.3, depth * 1.05]} />
            <meshStandardMaterial color={palette.roof} roughness={0.9} />
          </mesh>
          {/* casa de máquinas e antena no terraço */}
          <mesh position={[width * 0.18, height + 0.55, -depth * 0.15]} castShadow>
            <boxGeometry args={[0.7, 0.5, 0.6]} />
            <meshStandardMaterial color="#6e6e6a" roughness={0.85} />
          </mesh>
          <mesh position={[-width * 0.22, height + 0.85, depth * 0.18]} castShadow>
            <cylinderGeometry args={[0.02, 0.03, 1.4, 6]} />
            <meshStandardMaterial color="#8a8a8a" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      ) : (
        <mesh position={[0, height + 0.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[Math.max(width, depth) * 0.85, 1, 4]} />
          <meshStandardMaterial color={palette.roof} roughness={0.8} />
        </mesh>
      )}
    </group>
  );
}

function Quartel({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 3, 4]} />
        <meshStandardMaterial color="#5d7264" roughness={0.85} />
      </mesh>
      <mesh position={[0, 3.3, 0]} castShadow>
        <coneGeometry args={[3, 1.2, 4]} />
        <meshStandardMaterial color="#36443c" roughness={0.8} />
      </mesh>
      {/* portal de entrada */}
      <mesh position={[0, 0.9, 2.01]}>
        <planeGeometry args={[1.2, 1.8]} />
        <meshStandardMaterial color="#242c26" roughness={0.6} />
      </mesh>
      <Html position={[0, 4.2, 0]} center distanceFactor={14}>
        <div className="rounded bg-emerald-900/80 px-2 py-0.5 text-[10px] text-emerald-100 whitespace-nowrap">
          Quartel FSTS
        </div>
      </Html>
    </group>
  );
}

const NPC_FLEE_RADIUS = 3.5;
const NPC_UNIFORM_COLORS = ["#7a6a52", "#5c6b7a", "#6b5c52", "#4f6b5c"];

function NpcModel({ tint, moving }: { tint: string; moving: boolean }) {
  const gltf = useHumanoidModel();
  const cloned = useMemo(() => cloneSkeleton(gltf.scene), [gltf.scene]);
  const { actions } = useAnimations(gltf.animations, cloned);

  useEffect(() => {
    cloned.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        const mat = obj.material as THREE.MeshStandardMaterial;
        if (mat?.name?.toLowerCase().includes("body")) {
          mat.color = new THREE.Color(tint);
        }
      }
    });
  }, [cloned, tint]);

  useEffect(() => {
    const action = actions[moving ? "Walk" : "Idle"];
    if (!action) return;
    action.reset().fadeIn(0.2).play();
    return () => {
      action.fadeOut(0.2);
    };
  }, [actions, moving]);

  return <primitive object={cloned} />;
}

function Npc({
  x,
  z,
  playerPosRef,
  profile,
}: {
  x: number;
  z: number;
  playerPosRef: React.RefObject<THREE.Vector3>;
  profile?: NpcProfile;
}) {
  const ref = useRef<THREE.Group>(null);
  const [mood, setMood] = useState<"calmo" | "nervoso">("calmo");
  const [moving, setMoving] = useState(false);
  const [showLine, setShowLine] = useState(false);
  const homeRef = useRef(new THREE.Vector3(x, 0, z));
  const fleeingRef = useRef(false);
  const tint = NPC_UNIFORM_COLORS[Math.abs(Math.round(x * 3 + z * 5)) % NPC_UNIFORM_COLORS.length];

  useEffect(() => {
    if (!profile) return;
    const interval = setInterval(() => setShowLine((prev) => !prev), 5000);
    return () => clearInterval(interval);
  }, [profile]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const player = playerPosRef.current;
    const dist = player ? Math.hypot(ref.current.position.x - player.x, ref.current.position.z - player.z) : Infinity;
    const isNear = dist < NPC_FLEE_RADIUS;
    if (isNear !== fleeingRef.current) {
      fleeingRef.current = isNear;
      setMood(isNear ? "nervoso" : "calmo");
    }
    let didMove = false;
    if (isNear && player) {
      const dx = ref.current.position.x - player.x;
      const dz = ref.current.position.z - player.z;
      const len = Math.hypot(dx, dz) || 1;
      ref.current.position.x += (dx / len) * delta * 2.2;
      ref.current.position.z += (dz / len) * delta * 2.2;
      ref.current.rotation.y = Math.atan2(dx / len, dz / len);
      didMove = true;
    } else {
      const dx = homeRef.current.x - ref.current.position.x;
      const dz = homeRef.current.z - ref.current.position.z;
      if (Math.hypot(dx, dz) > 0.1) {
        ref.current.position.x += dx * delta * 0.5;
        ref.current.position.z += dz * delta * 0.5;
        ref.current.rotation.y = Math.atan2(dx, dz);
        didMove = true;
      }
    }
    if (didMove !== moving) setMoving(didMove);
  });

  const lineIndex = Math.abs(Math.round(x * 3 + z * 5)) % (profile?.lines.length ?? 1);

  return (
    <group ref={ref} position={[x, 0, z]}>
      <NpcModel tint={tint} moving={moving} />
      <Html position={[0, 1.9, 0]} center distanceFactor={12}>
        <div className="rounded bg-black/70 px-2 py-0.5 text-[10px] text-zinc-200 whitespace-nowrap">
          {profile && showLine
            ? `"${profile.lines[lineIndex]}"`
            : profile
              ? `${profile.name} · ${profile.role}`
              : `Cidadão · ${mood === "nervoso" ? "nervoso" : "calmo"}`}
        </div>
      </Html>
    </group>
  );
}

function Wheel({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0.32, z]} rotation={[0, 0, Math.PI / 2]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.32, 0.32, 0.24, 20]} />
        <meshStandardMaterial color="#141414" roughness={0.95} />
      </mesh>
      {/* calota */}
      <mesh position={[0, 0.125, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.17, 0.17, 0.02, 12]} />
        <meshStandardMaterial color="#9a9a9e" metalness={0.85} roughness={0.25} />
      </mesh>
    </group>
  );
}

/** Corpo da viatura — usado tanto estacionada quanto dirigida pelo jogador. */
function PatrolVehicleBody({ headlightsOn }: { headlightsOn: boolean }) {
  const headlightTarget = useMemo(() => {
    const target = new THREE.Object3D();
    target.position.set(0, 0.2, 12);
    return target;
  }, []);

  return (
    <group>
      {/* carroceria com pintura clearcoat */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[1.7, 0.55, 3.4]} />
        <meshPhysicalMaterial color="#2f6e4f" roughness={0.25} metalness={0.6} clearcoat={1} clearcoatRoughness={0.08} />
      </mesh>
      {/* capô inclinado */}
      <mesh position={[0, 0.86, 1.15]} castShadow>
        <boxGeometry args={[1.6, 0.16, 1.0]} />
        <meshPhysicalMaterial color="#2f6e4f" roughness={0.25} metalness={0.6} clearcoat={1} clearcoatRoughness={0.08} />
      </mesh>
      {/* cabine */}
      <mesh position={[0, 1.1, -0.35]} castShadow>
        <boxGeometry args={[1.5, 0.55, 1.7]} />
        <meshPhysicalMaterial color="#274d3b" roughness={0.3} metalness={0.5} clearcoat={0.8} clearcoatRoughness={0.1} />
      </mesh>
      {/* vidros */}
      <mesh position={[0, 1.1, -0.35]}>
        <boxGeometry args={[1.42, 0.42, 1.62]} />
        <meshPhysicalMaterial
          color="#1c2b33"
          transparent
          opacity={0.75}
          roughness={0.05}
          metalness={0.2}
          envMapIntensity={1.5}
        />
      </mesh>
      {/* giroflex */}
      <mesh position={[0, 1.44, -0.35]} castShadow>
        <boxGeometry args={[0.9, 0.1, 0.28]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
      </mesh>
      <mesh position={[-0.24, 1.44, -0.35]}>
        <boxGeometry args={[0.34, 0.11, 0.24]} />
        <meshStandardMaterial color="#d23b3b" emissive="#e02424" emissiveIntensity={headlightsOn ? 2.2 : 0.6} toneMapped={false} />
      </mesh>
      <mesh position={[0.24, 1.44, -0.35]}>
        <boxGeometry args={[0.34, 0.11, 0.24]} />
        <meshStandardMaterial color="#3b62d2" emissive="#2445e0" emissiveIntensity={headlightsOn ? 2.2 : 0.6} toneMapped={false} />
      </mesh>
      {/* para-choques */}
      <mesh position={[0, 0.32, 1.74]} castShadow>
        <boxGeometry args={[1.72, 0.22, 0.12]} />
        <meshStandardMaterial color="#2a2a2c" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.32, -1.74]} castShadow>
        <boxGeometry args={[1.72, 0.22, 0.12]} />
        <meshStandardMaterial color="#2a2a2c" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* faróis */}
      {[0.55, -0.55].map((side) => (
        <mesh key={`h${side}`} position={[side, 0.62, 1.72]}>
          <sphereGeometry args={[0.1, 10, 10]} />
          <meshStandardMaterial
            color="#fff7d8"
            emissive="#fff7d8"
            emissiveIntensity={headlightsOn ? 3.5 : 0.8}
            toneMapped={false}
          />
        </mesh>
      ))}
      {/* lanternas */}
      {[0.55, -0.55].map((side) => (
        <mesh key={`t${side}`} position={[side, 0.62, -1.72]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#e02424" emissive="#e02424" emissiveIntensity={headlightsOn ? 2.4 : 0.8} toneMapped={false} />
        </mesh>
      ))}
      {headlightsOn && (
        <>
          <primitive object={headlightTarget} />
          <spotLight
            position={[0.55, 0.62, 1.75]}
            target={headlightTarget}
            color="#fff3cf"
            intensity={30}
            distance={22}
            angle={0.45}
            penumbra={0.6}
            decay={2}
          />
          <spotLight
            position={[-0.55, 0.62, 1.75]}
            target={headlightTarget}
            color="#fff3cf"
            intensity={30}
            distance={22}
            angle={0.45}
            penumbra={0.6}
            decay={2}
          />
        </>
      )}
      <Wheel x={0.85} z={1.15} />
      <Wheel x={-0.85} z={1.15} />
      <Wheel x={0.85} z={-1.15} />
      <Wheel x={-0.85} z={-1.15} />
    </group>
  );
}

function ParkedVehicle({ x, z, occupied }: { x: number; z: number; occupied: boolean }) {
  const { streetlightsOn } = useDayNight();
  if (occupied) return null;
  return (
    <group position={[x, 0, z]}>
      <PatrolVehicleBody headlightsOn={false} />
      {streetlightsOn && (
        <pointLight position={[0, 1.6, 0]} color="#fff3cf" intensity={0.6} distance={4} decay={2} />
      )}
    </group>
  );
}

function DrivenVehicle() {
  const { streetlightsOn } = useDayNight();
  return <PatrolVehicleBody headlightsOn={streetlightsOn} />;
}

function MissionMarker({ x, z }: { x: number; z: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = 1 + Math.sin(clock.getElapsedTime() * 3) * 0.15;
  });
  return (
    <mesh ref={ref} position={[x, 1, z]}>
      <cylinderGeometry args={[0.3, 0.05, 1.4, 12]} />
      <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={1.4} />
    </mesh>
  );
}

function BossMarker({ x, z }: { x: number; z: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 2;
  });
  return (
    <group position={[x, 0, z]}>
      <mesh ref={ref} position={[0, 1.3, 0]}>
        <octahedronGeometry args={[0.4]} />
        <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={1.2} />
      </mesh>
      <Html position={[0, 2.1, 0]} center distanceFactor={12}>
        <div className="rounded bg-red-950/85 px-2 py-0.5 text-[10px] text-red-200 whitespace-nowrap">
          Presença suspeita
        </div>
      </Html>
    </group>
  );
}

function Ground({ color, wet }: { color: string; wet: boolean }) {
  const texture = getGroundTexture(color);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[120, 120]} />
      <meshStandardMaterial
        map={texture}
        color={wet ? "#8f8f92" : "#cfcfcf"}
        roughness={wet ? 0.45 : 0.95}
        metalness={wet ? 0.15 : 0}
      />
    </mesh>
  );
}

const RAIN_DROP_COUNT = 1200;

function Rain() {
  const ref = useRef<THREE.Points>(null);
  const positions = useState(() => {
    const arr = new Float32Array(RAIN_DROP_COUNT * 3);
    for (let i = 0; i < RAIN_DROP_COUNT; i++) {
      arr[i * 3] = (Math.abs(Math.sin(i * 12.9898)) - 0.5) * 50;
      arr[i * 3 + 1] = (Math.abs(Math.sin(i * 78.233)) % 1) * 20;
      arr[i * 3 + 2] = (Math.abs(Math.sin(i * 39.425)) - 0.5) * 50;
    }
    return arr;
  })[0];

  useFrame((_, delta) => {
    if (!ref.current) return;
    const attr = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < RAIN_DROP_COUNT; i++) {
      const y = attr.getY(i) - delta * 22;
      attr.setY(i, y < 0 ? 20 : y);
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#aac4d9" size={0.08} transparent opacity={0.55} />
    </points>
  );
}

function isRainy(regionId: RegionId) {
  const t = Math.floor(Date.now() / 60000);
  const seed = Array.from(regionId).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return (t + seed) % 5 === 0;
}

interface GameSceneProps {
  regionId: RegionId;
  activeMissionIndexes: number[];
  onMissionTrigger: (index: number) => void;
  onQuartelEnter: () => void;
  onPositionChange?: (x: number, z: number, inVehicle: boolean) => void;
  uniformColor: string;
  skinColor: string;
  resolvedBossIds: string[];
  onBossEncounter: (encounter: BossEncounter) => void;
}

export function GameScene({
  regionId,
  activeMissionIndexes,
  onMissionTrigger,
  onQuartelEnter,
  onPositionChange,
  uniformColor,
  skinColor,
  resolvedBossIds,
  onBossEncounter,
}: GameSceneProps) {
  const layout = REGION_WORLD_LAYOUTS[regionId];
  const [character, setCharacter] = useState<CharacterState>({
    position: new THREE.Vector3(0, 0, 0),
    yaw: 0,
    inVehicle: false,
  });
  const triggeredMissionRef = useRef<number | null>(null);
  const quartelTriggeredRef = useRef(false);
  const bossTriggeredRef = useRef(false);
  const playerPosRef = useRef(new THREE.Vector3(0, 0, 0));
  const rainy = isRainy(regionId);
  const [nearNpcIndex, setNearNpcIndex] = useState<number | null>(null);
  const [talkingNpcIndex, setTalkingNpcIndex] = useState<number | null>(null);
  const [talkLineIndex, setTalkLineIndex] = useState(0);
  const activeBoss = BOSS_ENCOUNTERS.find((b) => b.regionId === regionId && !resolvedBossIds.includes(b.id));

  function handleUpdate(pos: THREE.Vector3, yaw: number) {
    let nearMission = false;
    activeMissionIndexes.forEach((idx) => {
      const spawn = layout.missionSpawns[idx];
      if (!spawn) return;
      const dist = Math.hypot(pos.x - spawn.x, pos.z - spawn.z);
      if (dist < MISSION_TRIGGER_RADIUS) {
        nearMission = true;
        if (triggeredMissionRef.current !== idx) {
          triggeredMissionRef.current = idx;
          onMissionTrigger(idx);
        }
      }
    });
    if (!nearMission) triggeredMissionRef.current = null;

    const distToQuartel = Math.hypot(pos.x - layout.quartelSpawn.x, pos.z - layout.quartelSpawn.z);
    if (distToQuartel < QUARTEL_ENTER_RADIUS && !quartelTriggeredRef.current) {
      quartelTriggeredRef.current = true;
      onQuartelEnter();
    }
    if (distToQuartel > QUARTEL_ENTER_RADIUS + 1) {
      quartelTriggeredRef.current = false;
    }

    if (activeBoss) {
      const distToBoss = Math.hypot(pos.x - activeBoss.point.x, pos.z - activeBoss.point.z);
      if (distToBoss < BOSS_ENCOUNTER_RADIUS && !bossTriggeredRef.current) {
        bossTriggeredRef.current = true;
        onBossEncounter(activeBoss);
      }
    }

    playerPosRef.current.set(pos.x, pos.y, pos.z);
    setCharacter((prev) => ({ ...prev, position: pos, yaw }));
    onPositionChange?.(pos.x, pos.z, character.inVehicle);

    let near: number | null = null;
    layout.npcs.forEach((n, i) => {
      if (Math.hypot(pos.x - n.x, pos.z - n.z) < NPC_TALK_RADIUS) near = i;
    });
    setNearNpcIndex(near);
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.code === "Escape" && talkingNpcIndex !== null) {
      setTalkingNpcIndex(null);
      return;
    }
    if (e.code !== "KeyE") return;
    if (talkingNpcIndex !== null) {
      const profile = NPC_ROSTER[regionId]?.[talkingNpcIndex];
      if (profile) setTalkLineIndex((prev) => (prev + 1) % profile.lines.length);
      return;
    }
    if (nearNpcIndex !== null && NPC_ROSTER[regionId]?.[nearNpcIndex]) {
      setTalkingNpcIndex(nearNpcIndex);
      setTalkLineIndex(0);
      return;
    }
    const distToVehicle = Math.hypot(
      character.position.x - layout.vehicleSpawn.x,
      character.position.z - layout.vehicleSpawn.z
    );
    if (distToVehicle < VEHICLE_ENTER_RADIUS || character.inVehicle) {
      setCharacter((prev) => ({ ...prev, inVehicle: !prev.inVehicle }));
    }
  }

  const talkingProfile = talkingNpcIndex !== null ? NPC_ROSTER[regionId]?.[talkingNpcIndex] : undefined;

  return (
    <div
      className="h-full w-full outline-none"
      tabIndex={0}
      ref={(el) => el?.focus()}
      onKeyDown={handleKeyPress}
    >
      <Canvas
        shadows="soft"
        dpr={[1, 1.75]}
        camera={{ fov: 55, position: [0, 3, -6], far: 220 }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <WorldEnvironment lampPositions={layout.buildings.filter((_, i) => i % 2 === 0)} rainy={rainy}>
          <Ground color={layout.groundColor} wet={rainy} />
          <RoadNetwork plazaPoint={layout.vehicleSpawn} />
          {layout.buildings.map((b, i) => (
            <Building key={i} x={b.x} z={b.z} />
          ))}
          {layout.npcs.map((n, i) => (
            <Npc key={i} x={n.x} z={n.z} playerPosRef={playerPosRef} profile={NPC_ROSTER[regionId]?.[i]} />
          ))}
          {rainy && <Rain />}
          {activeBoss && <BossMarker x={activeBoss.point.x} z={activeBoss.point.z} />}
          <Quartel x={layout.quartelSpawn.x} z={layout.quartelSpawn.z} />
          <ParkedVehicle x={layout.vehicleSpawn.x} z={layout.vehicleSpawn.z} occupied={character.inVehicle} />
          {activeMissionIndexes.map((idx) =>
            layout.missionSpawns[idx] ? (
              <MissionMarker key={idx} x={layout.missionSpawns[idx].x} z={layout.missionSpawns[idx].z} />
            ) : null
          )}
          <CharacterController
            state={character}
            onUpdate={handleUpdate}
            uniformColor={uniformColor}
            skinColor={skinColor}
            vehicle={<DrivenVehicle />}
          />
        </WorldEnvironment>
        <EffectComposer multisampling={0}>
          <SMAA />
          <N8AO aoRadius={1.4} intensity={1.6} distanceFalloff={1} quality="performance" halfRes />
          <Bloom luminanceThreshold={0.9} luminanceSmoothing={0.3} intensity={0.5} mipmapBlur />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          <BrightnessContrast brightness={0.04} contrast={0.08} />
          <HueSaturation saturation={0.12} />
          <Vignette eskil={false} offset={0.18} darkness={0.55} />
        </EffectComposer>
      </Canvas>

      {talkingProfile && (
        <div className="pointer-events-none absolute bottom-24 left-1/2 w-full max-w-md -translate-x-1/2 rounded-lg border border-zinc-700 bg-black/85 p-3 text-sm text-white">
          <p className="text-amber-300">
            {talkingProfile.name} <span className="text-zinc-400">· {talkingProfile.role}</span>
          </p>
          <p className="mt-1">&ldquo;{talkingProfile.lines[talkLineIndex]}&rdquo;</p>
          <p className="mt-2 text-[10px] text-zinc-400">E: continuar · Esc: encerrar</p>
        </div>
      )}

      {!talkingProfile && nearNpcIndex !== null && NPC_ROSTER[regionId]?.[nearNpcIndex] && (
        <div className="pointer-events-none absolute bottom-24 left-1/2 -translate-x-1/2 rounded bg-black/70 px-3 py-1 text-xs text-amber-200">
          Pressione E para falar com {NPC_ROSTER[regionId][nearNpcIndex].name}
        </div>
      )}
    </div>
  );
}
