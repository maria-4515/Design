import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, GizmoHelper, GizmoViewport, TransformControls, Environment } from "@react-three/drei";
import { useEditorStore } from "@/lib/store";
import { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import type { SceneObject, ObjectType } from "@shared/schema";

function SceneMesh({ object, isSelected }: { object: SceneObject; isSelected: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { activeTool, setPosition, setRotation, setScale } = useEditorStore();
  
  const geometry = useMemo(() => {
    switch (object.type) {
      case "cube":
        return new THREE.BoxGeometry(1, 1, 1);
      case "sphere":
        return new THREE.SphereGeometry(0.5, 32, 32);
      case "cylinder":
        return new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
      case "plane":
        return new THREE.PlaneGeometry(2, 2);
      case "cone":
        return new THREE.ConeGeometry(0.5, 1, 32);
      case "torus":
        return new THREE.TorusGeometry(0.5, 0.2, 16, 32);
      case "group":
        return null;
      default:
        return new THREE.BoxGeometry(1, 1, 1);
    }
  }, [object.type]);
  
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: object.material.color,
      opacity: object.material.opacity,
      transparent: object.material.opacity < 1,
      metalness: object.material.metalness,
      roughness: object.material.roughness,
    });
  }, [object.material]);
  
  if (!object.visible) return null;
  if (!geometry) return null;
  
  const transformMode = activeTool === "select" ? undefined : activeTool;
  
  return (
    <>
      <mesh
        ref={meshRef}
        position={[object.position.x, object.position.y, object.position.z]}
        rotation={[
          THREE.MathUtils.degToRad(object.rotation.x),
          THREE.MathUtils.degToRad(object.rotation.y),
          THREE.MathUtils.degToRad(object.rotation.z),
        ]}
        scale={[object.scale.x, object.scale.y, object.scale.z]}
        geometry={geometry}
        material={material}
      />
      {isSelected && meshRef.current && transformMode && (
        <TransformControls
          object={meshRef.current}
          mode={transformMode}
          onObjectChange={() => {
            if (meshRef.current) {
              const pos = meshRef.current.position;
              const rot = meshRef.current.rotation;
              const scl = meshRef.current.scale;
              
              if (transformMode === "translate") {
                setPosition(object.id, { x: pos.x, y: pos.y, z: pos.z });
              } else if (transformMode === "rotate") {
                setRotation(object.id, {
                  x: THREE.MathUtils.radToDeg(rot.x),
                  y: THREE.MathUtils.radToDeg(rot.y),
                  z: THREE.MathUtils.radToDeg(rot.z),
                });
              } else if (transformMode === "scale") {
                setScale(object.id, { x: scl.x, y: scl.y, z: scl.z });
              }
            }
          }}
        />
      )}
    </>
  );
}

function SelectableObject({ object }: { object: SceneObject }) {
  const { selectedObjectId, selectObject } = useEditorStore();
  const isSelected = selectedObjectId === object.id;
  
  return (
    <group onClick={(e) => { e.stopPropagation(); selectObject(object.id); }}>
      <SceneMesh object={object} isSelected={isSelected} />
    </group>
  );
}

function Scene() {
  const { objects, selectObject } = useEditorStore();
  
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <directionalLight position={[-10, -10, -5]} intensity={0.3} />
      
      <Grid
        position={[0, 0, 0]}
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#404040"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#606060"
        fadeDistance={30}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={true}
      />
      
      {/* Axis helper lines */}
      <group>
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([0, 0, 0, 5, 0, 0])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#ef4444" linewidth={2} />
        </line>
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([0, 0, 0, 0, 5, 0])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#22c55e" linewidth={2} />
        </line>
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([0, 0, 0, 0, 0, 5])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#3b82f6" linewidth={2} />
        </line>
      </group>
      
      {objects.map((object) => (
        <SelectableObject key={object.id} object={object} />
      ))}
      
      {/* Click on empty space to deselect */}
      <mesh
        visible={false}
        position={[0, -0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={() => selectObject(null)}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </>
  );
}

export function Viewport() {
  return (
    <div className="w-full h-full bg-[#1a1a1a]" data-testid="viewport-container">
      <Canvas
        camera={{ position: [5, 5, 5], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
        shadows
      >
        <color attach="background" args={["#1a1a1a"]} />
        <Scene />
        <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
        <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
          <GizmoViewport
            axisColors={["#ef4444", "#22c55e", "#3b82f6"]}
            labelColor="white"
          />
        </GizmoHelper>
      </Canvas>
    </div>
  );
}
