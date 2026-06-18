"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, useAnimations } from "@react-three/drei";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";
import { CharacterController, type CharacterState, useHumanoidModel } from "./CharacterController";

const FORMATION_POINT = { x: 0, z: -10 };
const INSTRUCTOR_POINT = { x: 1.2, z: -10.5 };
const FORMATION_RADIUS = 2.5;

function YardLight() {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight castShadow position={[6, 10, 4]} intensity={0.9} />
    </>
  );
}

function Barracks({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[6, 2.8, 3.2]} />
        <meshStandardMaterial color="#5c5a4e" />
      </mesh>
      <mesh position={[0, 3, 0]} castShadow>
        <boxGeometry args={[6.3, 0.3, 3.5]} />
        <meshStandardMaterial color="#36342c" />
      </mesh>
    </group>
  );
}

function Instructor() {
  const gltf = useHumanoidModel();
  const cloned = useMemo(() => cloneSkeleton(gltf.scene), [gltf.scene]);
  const { actions } = useAnimations(gltf.animations, cloned);

  useEffect(() => {
    cloned.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true;
        const mat = obj.material as THREE.MeshStandardMaterial;
        if (mat?.name?.toLowerCase().includes("body")) {
          mat.color = new THREE.Color("#3c4a36");
        }
      }
    });
  }, [cloned]);

  useEffect(() => {
    actions.Idle?.reset().fadeIn(0.2).play();
  }, [actions]);

  return (
    <group position={[INSTRUCTOR_POINT.x, 0, INSTRUCTOR_POINT.z]} rotation={[0, Math.PI, 0]}>
      <primitive object={cloned} />
      <Html position={[0, 1.9, 0]} center distanceFactor={12}>
        <div className="rounded bg-emerald-900/80 px-2 py-0.5 text-[10px] text-emerald-100 whitespace-nowrap">
          Instrutor Cordeiro
        </div>
      </Html>
    </group>
  );
}

function FormationMarker() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = 1 + Math.sin(clock.getElapsedTime() * 3) * 0.15;
  });
  return (
    <group position={[FORMATION_POINT.x, 0, FORMATION_POINT.z]}>
      <mesh ref={ref} position={[0, 1, 0]}>
        <cylinderGeometry args={[0.3, 0.05, 1.4, 12]} />
        <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={1.4} />
      </mesh>
      <Html position={[0, 2.2, 0]} center distanceFactor={12}>
        <div className="rounded bg-black/70 px-2 py-0.5 text-[10px] text-amber-200 whitespace-nowrap">
          Apresentar-se em formatura
        </div>
      </Html>
    </group>
  );
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial color="#7a6f4f" />
    </mesh>
  );
}

interface AcademySceneProps {
  onComplete: () => void;
  uniformColor: string;
  skinColor: string;
}

export function AcademyScene({ onComplete, uniformColor, skinColor }: AcademySceneProps) {
  const [character, setCharacter] = useState<CharacterState>({
    position: new THREE.Vector3(0, 0, 0),
    yaw: Math.PI,
    inVehicle: false,
  });
  const completedRef = useRef(false);

  function handleUpdate(pos: THREE.Vector3, yaw: number) {
    const dist = Math.hypot(pos.x - FORMATION_POINT.x, pos.z - FORMATION_POINT.z);
    if (dist < FORMATION_RADIUS && !completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
    setCharacter((prev) => ({ ...prev, position: pos, yaw }));
  }

  return (
    <div className="h-full w-full outline-none" tabIndex={0} ref={(el) => el?.focus()}>
      <Canvas shadows camera={{ fov: 60, position: [0, 3, -6] }}>
        <color attach="background" args={["#1b2530"]} />
        <fog attach="fog" args={["#1b2530", 10, 40]} />
        <YardLight />
        <Ground />
        <Barracks x={-8} z={-2} />
        <Barracks x={8} z={-2} />
        <Instructor />
        <FormationMarker />
        <CharacterController state={character} onUpdate={handleUpdate} uniformColor={uniformColor} skinColor={skinColor} />
      </Canvas>
    </div>
  );
}
