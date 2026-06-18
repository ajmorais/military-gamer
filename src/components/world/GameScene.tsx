"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Sky, useAnimations } from "@react-three/drei";
import { Bloom, EffectComposer, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";
import type { RegionId } from "@/types";
import { REGION_WORLD_LAYOUTS } from "@/modules/world/regionLayouts";
import { NPC_ROSTER, type NpcProfile } from "@/modules/npcs/npcRoster";
import { BOSS_ENCOUNTERS, type BossEncounter } from "@/modules/narrative/bosses";
import { CharacterController, type CharacterState, useHumanoidModel } from "./CharacterController";
import { useDayNightCycle } from "./useDayNightCycle";

const VEHICLE_ENTER_RADIUS = 2.2;
const MISSION_TRIGGER_RADIUS = 2.5;
const QUARTEL_ENTER_RADIUS = 2.8;
const NPC_TALK_RADIUS = 2.6;
const BOSS_ENCOUNTER_RADIUS = 2.5;

function DayNightLight({
  sunPosition,
  sunIntensity,
  ambientIntensity,
}: {
  sunPosition: [number, number, number];
  sunIntensity: number;
  ambientIntensity: number;
}) {
  return (
    <>
      <ambientLight intensity={ambientIntensity} />
      <directionalLight
        castShadow
        position={sunPosition}
        intensity={sunIntensity}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
      />
      <hemisphereLight args={["#bcd6ee", "#3a3528", 0.35]} />
    </>
  );
}

function StreetLamp({ x, z, lit }: { x: number; z: number; lit: boolean }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 1.6, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 3.2, 8]} />
        <meshStandardMaterial color="#1f1f22" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 3.25, 0]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshStandardMaterial
          color="#ffe9b0"
          emissive="#ffd27a"
          emissiveIntensity={lit ? 2.4 : 0.1}
          toneMapped={false}
        />
      </mesh>
      {lit && <pointLight position={[0, 3.2, 0]} color="#ffd27a" intensity={2.2} distance={9} decay={2} />}
    </group>
  );
}

function SceneAtmosphere({ lampPositions }: { lampPositions: { x: number; z: number }[] }) {
  const { sunPosition, sunIntensity, ambientIntensity, skyColor, streetlightsOn } = useDayNightCycle();
  return (
    <>
      <color attach="background" args={[skyColor]} />
      <fog attach="fog" args={[skyColor, 10, 45]} />
      <Sky sunPosition={sunPosition} turbidity={8} rayleigh={2.2} mieCoefficient={0.01} mieDirectionalG={0.8} />
      <DayNightLight sunPosition={sunPosition} sunIntensity={sunIntensity} ambientIntensity={ambientIntensity} />
      {lampPositions.map((p, i) => (
        <StreetLamp key={i} x={p.x} z={p.z} lit={streetlightsOn} />
      ))}
    </>
  );
}

const BUILDING_PALETTES = [
  { wall: "#5b6168", roof: "#3c4148", trim: "#d9c98c" },
  { wall: "#7a6552", roof: "#4a3c30", trim: "#e8e4d0" },
  { wall: "#54625f", roof: "#33403c", trim: "#bcd6cf" },
  { wall: "#6b5a6b", roof: "#3f343f", trim: "#e0c8e0" },
];

function Building({ x, z }: { x: number; z: number }) {
  const seed = Math.abs(Math.round(x * 7 + z * 13));
  const height = 2 + (seed % 10 / 10) * 6;
  const width = 1.8 + (seed % 4) * 0.4;
  const depth = 1.8 + ((seed >> 2) % 4) * 0.4;
  const floors = Math.max(1, Math.round(height / 1.4));
  const palette = BUILDING_PALETTES[seed % BUILDING_PALETTES.length];
  const hasFlatRoof = seed % 3 === 0;

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={palette.wall} roughness={0.85} metalness={0.05} />
      </mesh>
      {Array.from({ length: floors }).map((_, floor) => (
        <mesh key={floor} position={[width / 2 + 0.01, 0.7 + floor * 1.4, 0]}>
          <planeGeometry args={[depth * 0.7, 0.5]} />
          <meshStandardMaterial
            color={palette.trim}
            emissive={palette.trim}
            emissiveIntensity={0.6}
            toneMapped={false}
          />
        </mesh>
      ))}
      {hasFlatRoof ? (
        <mesh position={[0, height + 0.15, 0]} castShadow>
          <boxGeometry args={[width * 1.05, 0.3, depth * 1.05]} />
          <meshStandardMaterial color={palette.roof} roughness={0.9} />
        </mesh>
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
        <meshStandardMaterial color="#4b5d52" />
      </mesh>
      <mesh position={[0, 3.3, 0]} castShadow>
        <coneGeometry args={[3, 1.2, 4]} />
        <meshStandardMaterial color="#36443c" />
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
    <mesh position={[x, 0.32, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[0.32, 0.32, 0.24, 16]} />
      <meshStandardMaterial color="#1c1c1c" />
    </mesh>
  );
}

function VehicleModel({ x, z, occupied }: { x: number; z: number; occupied: boolean }) {
  if (occupied) return null;
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[1.7, 0.7, 3.4]} />
        <meshStandardMaterial color="#2f6e4f" roughness={0.35} metalness={0.4} />
      </mesh>
      <mesh position={[0, 1.05, -0.2]} castShadow>
        <boxGeometry args={[1.5, 0.55, 1.8]} />
        <meshStandardMaterial color="#274d3b" roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[0, 1.05, -0.2]}>
        <boxGeometry args={[1.42, 0.4, 1.7]} />
        <meshStandardMaterial color="#9fd1e8" transparent opacity={0.55} roughness={0.1} metalness={0.6} />
      </mesh>
      <mesh position={[0.55, 0.55, 1.72]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#fff7d8" emissive="#fff7d8" emissiveIntensity={2.5} toneMapped={false} />
      </mesh>
      <mesh position={[-0.55, 0.55, 1.72]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#fff7d8" emissive="#fff7d8" emissiveIntensity={2.5} toneMapped={false} />
      </mesh>
      <mesh position={[0.55, 0.55, -1.72]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#e02424" emissive="#e02424" emissiveIntensity={2} toneMapped={false} />
      </mesh>
      <mesh position={[-0.55, 0.55, -1.72]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#e02424" emissive="#e02424" emissiveIntensity={2} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 0.6, 2.2]} color="#fff7d8" intensity={1.4} distance={6} decay={2} />
      <Wheel x={0.85} z={1.15} />
      <Wheel x={-0.85} z={1.15} />
      <Wheel x={0.85} z={-1.15} />
      <Wheel x={-0.85} z={-1.15} />
    </group>
  );
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

function Ground({ color }: { color: string }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial color={color} roughness={0.95} metalness={0} />
    </mesh>
  );
}

const RAIN_DROP_COUNT = 400;

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
      const y = attr.getY(i) - delta * 14;
      attr.setY(i, y < 0 ? 20 : y);
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#aac4d9" size={0.12} transparent opacity={0.6} />
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
      <Canvas shadows camera={{ fov: 60, position: [0, 3, -6] }} gl={{ antialias: true }}>
        <SceneAtmosphere lampPositions={layout.buildings.filter((_, i) => i % 2 === 0)} />
        <Ground color={layout.groundColor} />
        {layout.buildings.map((b, i) => (
          <Building key={i} x={b.x} z={b.z} />
        ))}
        {layout.npcs.map((n, i) => (
          <Npc key={i} x={n.x} z={n.z} playerPosRef={playerPosRef} profile={NPC_ROSTER[regionId]?.[i]} />
        ))}
        {rainy && <Rain />}
        {activeBoss && <BossMarker x={activeBoss.point.x} z={activeBoss.point.z} />}
        <Quartel x={layout.quartelSpawn.x} z={layout.quartelSpawn.z} />
        <VehicleModel x={layout.vehicleSpawn.x} z={layout.vehicleSpawn.z} occupied={character.inVehicle} />
        {activeMissionIndexes.map((idx) =>
          layout.missionSpawns[idx] ? (
            <MissionMarker key={idx} x={layout.missionSpawns[idx].x} z={layout.missionSpawns[idx].z} />
          ) : null
        )}
        <CharacterController state={character} onUpdate={handleUpdate} uniformColor={uniformColor} skinColor={skinColor} />
        <EffectComposer multisampling={0}>
          <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.2} intensity={0.6} mipmapBlur />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          <Vignette eskil={false} offset={0.15} darkness={0.6} />
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
