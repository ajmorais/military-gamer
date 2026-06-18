"use client";

import { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { CharacterController, type CharacterState } from "./CharacterController";

interface RoomDef {
  label: string;
  x: number;
  z: number;
  color: string;
  interactive?: boolean;
}

const ROOMS: RoomDef[] = [
  { label: "Dormitório", x: -7, z: -4, color: "#3c4a52" },
  { label: "Refeitório", x: 7, z: -4, color: "#52483c" },
  { label: "Auditório", x: -7, z: 4, color: "#43403c" },
  { label: "Centro de Treinamento", x: 7, z: 4, color: "#3c5244", interactive: true },
  { label: "Centro de Comando", x: 0, z: 8, color: "#3c3c52", interactive: true },
  { label: "Garagem", x: 0, z: -8, color: "#4a4a4a" },
];

const ROOM_RADIUS = 2.4;
const EXIT_POINT = { x: 0, z: 0 };
const EXIT_RADIUS = 1.8;

function RoomFloor({ room }: { room: RoomDef }) {
  return (
    <group position={[room.x, 0, room.z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5.2, 5.2]} />
        <meshStandardMaterial color={room.color} />
      </mesh>
      <Html position={[0, 0.1, 0]} center distanceFactor={12}>
        <div
          className={`rounded px-2 py-0.5 text-[10px] whitespace-nowrap ${
            room.interactive ? "bg-emerald-900/80 text-emerald-100" : "bg-black/70 text-zinc-200"
          }`}
        >
          {room.label}
          {room.interactive && " · pressione E"}
        </div>
      </Html>
    </group>
  );
}

function HallFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[24, 24]} />
      <meshStandardMaterial color="#2c2c30" />
    </mesh>
  );
}

interface QuartelInteriorProps {
  onOpenTraining: () => void;
  onOpenCommand: () => void;
  onExit: () => void;
  uniformColor: string;
  skinColor: string;
}

export function QuartelInterior({ onOpenTraining, onOpenCommand, onExit, uniformColor, skinColor }: QuartelInteriorProps) {
  const [character, setCharacter] = useState<CharacterState>({
    position: new THREE.Vector3(0, 0, 0),
    yaw: 0,
    inVehicle: false,
  });
  const nearRoomRef = useRef<RoomDef | null>(null);
  const nearExitRef = useRef(false);

  function handleUpdate(pos: THREE.Vector3, yaw: number) {
    let near: RoomDef | null = null;
    for (const room of ROOMS) {
      if (room.interactive && Math.hypot(pos.x - room.x, pos.z - room.z) < ROOM_RADIUS) {
        near = room;
        break;
      }
    }
    nearRoomRef.current = near;
    nearExitRef.current = Math.hypot(pos.x - EXIT_POINT.x, pos.z - EXIT_POINT.z) < EXIT_RADIUS;
    setCharacter((prev) => ({ ...prev, position: pos, yaw }));
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.code === "KeyE" && nearRoomRef.current) {
      if (nearRoomRef.current.label === "Centro de Treinamento") onOpenTraining();
      if (nearRoomRef.current.label === "Centro de Comando") onOpenCommand();
    }
    if (e.code === "Escape" && nearExitRef.current) onExit();
  }

  return (
    <div className="h-full w-full outline-none" tabIndex={0} ref={(el) => el?.focus()} onKeyDown={handleKeyPress}>
      <Canvas shadows camera={{ fov: 60, position: [0, 3, -6] }}>
        <color attach="background" args={["#15151a"]} />
        <ambientLight intensity={0.9} />
        <directionalLight castShadow position={[4, 8, 4]} intensity={0.7} />
        <HallFloor />
        {ROOMS.map((room) => (
          <RoomFloor key={room.label} room={room} />
        ))}
        <Html position={[EXIT_POINT.x, 0.1, EXIT_POINT.z]} center distanceFactor={12}>
          <div className="rounded bg-amber-900/80 px-2 py-0.5 text-[10px] text-amber-100 whitespace-nowrap">
            Saída · Esc
          </div>
        </Html>
        <CharacterController state={character} onUpdate={handleUpdate} uniformColor={uniformColor} skinColor={skinColor} />
      </Canvas>
    </div>
  );
}
