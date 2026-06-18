"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { RegionId } from "@/types";
import { REGION_WORLD_LAYOUTS } from "@/modules/world/regionLayouts";
import { CharacterController, type CharacterState } from "./CharacterController";

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

function Npc({ x, z }: { x: number; z: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = Math.abs(Math.sin(clock.getElapsedTime() * 2 + x)) * 0.05;
    }
  });
  return (
    <group ref={ref} position={[x, 0, z]}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <capsuleGeometry args={[0.28, 0.8, 4, 8]} />
        <meshStandardMaterial color="#8a7a5c" />
      </mesh>
      <Html position={[0, 1.9, 0]} center distanceFactor={12}>
        <div className="rounded bg-black/70 px-2 py-0.5 text-[10px] text-zinc-200 whitespace-nowrap">
          Cidadão
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
          <Npc key={i} x={n.x} z={n.z} />
        ))}
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
