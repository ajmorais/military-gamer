"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, useAnimations } from "@react-three/drei";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";
import type { RegionId } from "@/types";
import { REGION_WORLD_LAYOUTS } from "@/modules/world/regionLayouts";
import { CharacterController, type CharacterState, useHumanoidModel } from "./CharacterController";

const VEHICLE_ENTER_RADIUS = 2.2;
const MISSION_TRIGGER_RADIUS = 2.5;
const QUARTEL_ENTER_RADIUS = 2.8;

function DayNightLight() {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.04;
    const intensity = 0.55 + Math.sin(t) * 0.35;
    if (lightRef.current) {
      lightRef.current.intensity = Math.max(0.25, intensity);
      lightRef.current.position.set(Math.cos(t) * 10, 8 + Math.sin(t) * 4, Math.sin(t) * 10);
    }
  });
  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight ref={lightRef} castShadow position={[6, 10, 4]} />
    </>
  );
}

function Building({ x, z }: { x: number; z: number }) {
  const height = 2 + ((Math.abs(x * 7 + z * 13) % 10) / 10) * 6;
  return (
    <mesh position={[x, height / 2, z]} castShadow receiveShadow>
      <boxGeometry args={[2.4, height, 2.4]} />
      <meshStandardMaterial color="#5b6168" />
    </mesh>
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

function Npc({ x, z, playerPosRef }: { x: number; z: number; playerPosRef: React.RefObject<THREE.Vector3> }) {
  const ref = useRef<THREE.Group>(null);
  const [mood, setMood] = useState<"calmo" | "nervoso">("calmo");
  const [moving, setMoving] = useState(false);
  const homeRef = useRef(new THREE.Vector3(x, 0, z));
  const fleeingRef = useRef(false);
  const tint = NPC_UNIFORM_COLORS[Math.abs(Math.round(x * 3 + z * 5)) % NPC_UNIFORM_COLORS.length];

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

  return (
    <group ref={ref} position={[x, 0, z]}>
      <NpcModel tint={tint} moving={moving} />
      <Html position={[0, 1.9, 0]} center distanceFactor={12}>
        <div className="rounded bg-black/70 px-2 py-0.5 text-[10px] text-zinc-200 whitespace-nowrap">
          Cidadão · {mood === "nervoso" ? "nervoso" : "calmo"}
        </div>
      </Html>
    </group>
  );
}

function VehicleModel({ x, z, occupied }: { x: number; z: number; occupied: boolean }) {
  if (occupied) return null;
  return (
    <mesh position={[x, 0.5, z]} castShadow>
      <boxGeometry args={[1.6, 0.9, 3.2]} />
      <meshStandardMaterial color="#2f6e4f" />
    </mesh>
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

function Ground({ color }: { color: string }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial color={color} />
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
}

export function GameScene({
  regionId,
  activeMissionIndexes,
  onMissionTrigger,
  onQuartelEnter,
  onPositionChange,
  uniformColor,
  skinColor,
}: GameSceneProps) {
  const layout = REGION_WORLD_LAYOUTS[regionId];
  const [character, setCharacter] = useState<CharacterState>({
    position: new THREE.Vector3(0, 0, 0),
    yaw: 0,
    inVehicle: false,
  });
  const triggeredMissionRef = useRef<number | null>(null);
  const quartelTriggeredRef = useRef(false);
  const playerPosRef = useRef(new THREE.Vector3(0, 0, 0));
  const rainy = isRainy(regionId);

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

    playerPosRef.current.set(pos.x, pos.y, pos.z);
    setCharacter((prev) => ({ ...prev, position: pos, yaw }));
    onPositionChange?.(pos.x, pos.z, character.inVehicle);
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.code !== "KeyE") return;
    const distToVehicle = Math.hypot(
      character.position.x - layout.vehicleSpawn.x,
      character.position.z - layout.vehicleSpawn.z
    );
    if (distToVehicle < VEHICLE_ENTER_RADIUS || character.inVehicle) {
      setCharacter((prev) => ({ ...prev, inVehicle: !prev.inVehicle }));
    }
  }

  return (
    <div
      className="h-full w-full outline-none"
      tabIndex={0}
      ref={(el) => el?.focus()}
      onKeyDown={handleKeyPress}
    >
      <Canvas shadows camera={{ fov: 60, position: [0, 3, -6] }}>
        <color attach="background" args={[layout.skyColor]} />
        <fog attach="fog" args={[layout.skyColor, 10, 40]} />
        <DayNightLight />
        <Ground color={layout.groundColor} />
        {layout.buildings.map((b, i) => (
          <Building key={i} x={b.x} z={b.z} />
        ))}
        {layout.npcs.map((n, i) => (
          <Npc key={i} x={n.x} z={n.z} playerPosRef={playerPosRef} />
        ))}
        {rainy && <Rain />}
        <Quartel x={layout.quartelSpawn.x} z={layout.quartelSpawn.z} />
        <VehicleModel x={layout.vehicleSpawn.x} z={layout.vehicleSpawn.z} occupied={character.inVehicle} />
        {activeMissionIndexes.map((idx) =>
          layout.missionSpawns[idx] ? (
            <MissionMarker key={idx} x={layout.missionSpawns[idx].x} z={layout.missionSpawns[idx].z} />
          ) : null
        )}
        <CharacterController state={character} onUpdate={handleUpdate} uniformColor={uniformColor} skinColor={skinColor} />
      </Canvas>
    </div>
  );
}
