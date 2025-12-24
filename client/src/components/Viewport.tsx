import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, GizmoHelper, GizmoViewport, TransformControls, PerspectiveCamera } from "@react-three/drei";
import { useEditorStore } from "@/lib/store";
import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import type { SceneObject, CameraKeyframe, Vector3, Keyframe } from "@shared/schema";
import { isLightType } from "@shared/schema";

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpVector3(a: Vector3, b: Vector3, t: number): Vector3 {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    z: lerp(a.z, b.z, t),
  };
}

function interpolateCameraKeyframes(keyframes: CameraKeyframe[], frame: number, defaultPos: Vector3, defaultTarget: Vector3, defaultFov: number) {
  if (keyframes.length === 0) {
    return { position: defaultPos, target: defaultTarget, fov: defaultFov };
  }
  
  const sorted = [...keyframes].sort((a, b) => a.frame - b.frame);
  
  if (frame <= sorted[0].frame) {
    return { position: sorted[0].position, target: sorted[0].target, fov: sorted[0].fov };
  }
  
  if (frame >= sorted[sorted.length - 1].frame) {
    const last = sorted[sorted.length - 1];
    return { position: last.position, target: last.target, fov: last.fov };
  }
  
  for (let i = 0; i < sorted.length - 1; i++) {
    if (frame >= sorted[i].frame && frame <= sorted[i + 1].frame) {
      const t = (frame - sorted[i].frame) / (sorted[i + 1].frame - sorted[i].frame);
      return {
        position: lerpVector3(sorted[i].position, sorted[i + 1].position, t),
        target: lerpVector3(sorted[i].target, sorted[i + 1].target, t),
        fov: lerp(sorted[i].fov, sorted[i + 1].fov, t),
      };
    }
  }
  
  return { position: defaultPos, target: defaultTarget, fov: defaultFov };
}

function interpolateObjectKeyframes(
  keyframes: Keyframe[],
  frame: number,
  defaultPos: Vector3,
  defaultRot: Vector3,
  defaultScale: Vector3
): { position: Vector3; rotation: Vector3; scale: Vector3 } {
  if (keyframes.length === 0) {
    return { position: defaultPos, rotation: defaultRot, scale: defaultScale };
  }
  
  const sorted = [...keyframes].sort((a, b) => a.frame - b.frame);
  
  const getTransform = (kf: Keyframe) => ({
    position: kf.position || defaultPos,
    rotation: kf.rotation || defaultRot,
    scale: kf.scale || defaultScale,
  });
  
  if (frame <= sorted[0].frame) {
    return getTransform(sorted[0]);
  }
  
  if (frame >= sorted[sorted.length - 1].frame) {
    return getTransform(sorted[sorted.length - 1]);
  }
  
  for (let i = 0; i < sorted.length - 1; i++) {
    if (frame >= sorted[i].frame && frame <= sorted[i + 1].frame) {
      const t = (frame - sorted[i].frame) / (sorted[i + 1].frame - sorted[i].frame);
      const from = getTransform(sorted[i]);
      const to = getTransform(sorted[i + 1]);
      return {
        position: lerpVector3(from.position, to.position, t),
        rotation: lerpVector3(from.rotation, to.rotation, t),
        scale: lerpVector3(from.scale, to.scale, t),
      };
    }
  }
  
  return { position: defaultPos, rotation: defaultRot, scale: defaultScale };
}

function CameraController() {
  const { camera, currentFrame, isPlaying, setCameraPosition, setCameraTarget } = useEditorStore();
  const { camera: threeCamera } = useThree();
  const controlsRef = useRef<any>(null);
  
  useEffect(() => {
    if (isPlaying && camera.keyframes.length > 0) {
      const { position, target, fov } = interpolateCameraKeyframes(
        camera.keyframes,
        currentFrame,
        camera.position,
        camera.target,
        camera.fov
      );
      
      threeCamera.position.set(position.x, position.y, position.z);
      if (threeCamera instanceof THREE.PerspectiveCamera) {
        threeCamera.fov = fov;
        threeCamera.updateProjectionMatrix();
      }
      if (controlsRef.current) {
        controlsRef.current.target.set(target.x, target.y, target.z);
        controlsRef.current.update();
      }
    }
  }, [currentFrame, isPlaying, camera.keyframes, camera.position, camera.target, camera.fov, threeCamera]);
  
  useEffect(() => {
    if (!isPlaying) {
      threeCamera.position.set(camera.position.x, camera.position.y, camera.position.z);
      if (threeCamera instanceof THREE.PerspectiveCamera) {
        threeCamera.fov = camera.fov;
        threeCamera.updateProjectionMatrix();
      }
      if (controlsRef.current) {
        controlsRef.current.target.set(camera.target.x, camera.target.y, camera.target.z);
        controlsRef.current.update();
      }
    }
  }, [camera.position, camera.target, camera.fov, threeCamera, isPlaying]);
  
  const handleControlsChange = () => {
    if (!isPlaying && controlsRef.current) {
      const pos = threeCamera.position;
      const target = controlsRef.current.target;
      setCameraPosition({ x: pos.x, y: pos.y, z: pos.z });
      setCameraTarget({ x: target.x, y: target.y, z: target.z });
    }
  };
  
  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.05}
      onEnd={handleControlsChange}
    />
  );
}

function VertexPoints({ 
  geometry, 
  position, 
  rotation, 
  scale,
  objectId 
}: { 
  geometry: THREE.BufferGeometry;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  objectId: string;
}) {
  const { selectedVertexIndex, selectVertex, selectedObjectId } = useEditorStore();
  
  const vertices = useMemo(() => {
    const positionAttribute = geometry.getAttribute('position');
    if (!positionAttribute) return [];
    
    const uniqueVertices: THREE.Vector3[] = [];
    const seen = new Set<string>();
    
    for (let i = 0; i < positionAttribute.count; i++) {
      const x = positionAttribute.getX(i);
      const y = positionAttribute.getY(i);
      const z = positionAttribute.getZ(i);
      const key = `${x.toFixed(4)},${y.toFixed(4)},${z.toFixed(4)}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueVertices.push(new THREE.Vector3(x, y, z));
      }
    }
    return uniqueVertices;
  }, [geometry]);
  
  const isThisObjectSelected = selectedObjectId === objectId;
  
  return (
    <group 
      position={position}
      rotation={rotation}
      scale={scale}
    >
      {vertices.map((vertex, index) => (
        <mesh
          key={index}
          position={[vertex.x, vertex.y, vertex.z]}
          onClick={(e) => {
            e.stopPropagation();
            if (isThisObjectSelected) {
              selectVertex(selectedVertexIndex === index ? null : index);
            }
          }}
        >
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial 
            color={isThisObjectSelected && selectedVertexIndex === index ? "#ffff00" : "#00aaff"} 
          />
        </mesh>
      ))}
    </group>
  );
}

function SceneMesh({ object, isSelected }: { object: SceneObject; isSelected: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { activeTool, setPosition, setRotation, setScale, editMode, isPlaying, currentFrame } = useEditorStore();
  
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
      case "pointLight":
      case "directionalLight":
      case "spotLight":
      case "ambientLight":
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
  
  // Interpolate transform from keyframes during playback
  const animatedTransform = useMemo(() => {
    if (isPlaying && object.keyframes && object.keyframes.length > 0) {
      return interpolateObjectKeyframes(
        object.keyframes,
        currentFrame,
        object.position,
        object.rotation,
        object.scale
      );
    }
    return { position: object.position, rotation: object.rotation, scale: object.scale };
  }, [isPlaying, currentFrame, object.keyframes, object.position, object.rotation, object.scale]);
  
  if (!object.visible) return null;
  if (!geometry) return null;
  
  const transformMode = activeTool === "select" ? undefined : activeTool;
  const showVertices = editMode === "vertex" && isSelected;
  
  const positionTuple: [number, number, number] = [animatedTransform.position.x, animatedTransform.position.y, animatedTransform.position.z];
  const rotationTuple: [number, number, number] = [
    THREE.MathUtils.degToRad(animatedTransform.rotation.x),
    THREE.MathUtils.degToRad(animatedTransform.rotation.y),
    THREE.MathUtils.degToRad(animatedTransform.rotation.z),
  ];
  const scaleTuple: [number, number, number] = [animatedTransform.scale.x, animatedTransform.scale.y, animatedTransform.scale.z];
  
  return (
    <>
      <mesh
        ref={meshRef}
        position={positionTuple}
        rotation={rotationTuple}
        scale={scaleTuple}
        geometry={geometry}
        material={material}
      />
      {showVertices && geometry && (
        <VertexPoints 
          geometry={geometry}
          position={positionTuple}
          rotation={rotationTuple}
          scale={scaleTuple}
          objectId={object.id}
        />
      )}
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

function PointLight({ object }: { object: SceneObject }) {
  const { intensity, color, castShadow, distance, decay } = object.lightProperties!;
  return (
    <pointLight
      position={[object.position.x, object.position.y, object.position.z]}
      intensity={intensity}
      color={color}
      castShadow={castShadow}
      distance={distance}
      decay={decay}
    />
  );
}

function DirectionalLight({ object }: { object: SceneObject }) {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const targetRef = useRef<THREE.Object3D>(null);
  const { intensity, color, castShadow } = object.lightProperties!;
  
  const direction = useMemo(() => {
    const euler = new THREE.Euler(
      THREE.MathUtils.degToRad(object.rotation.x),
      THREE.MathUtils.degToRad(object.rotation.y),
      THREE.MathUtils.degToRad(object.rotation.z)
    );
    const dir = new THREE.Vector3(0, -1, 0);
    dir.applyEuler(euler);
    return dir;
  }, [object.rotation]);
  
  const targetPos: [number, number, number] = useMemo(() => [
    object.position.x + direction.x * 5,
    object.position.y + direction.y * 5,
    object.position.z + direction.z * 5,
  ], [object.position, direction]);
  
  useEffect(() => {
    if (lightRef.current && targetRef.current) {
      lightRef.current.target = targetRef.current;
    }
  }, []);
  
  return (
    <group>
      <directionalLight
        ref={lightRef}
        position={[object.position.x, object.position.y, object.position.z]}
        intensity={intensity}
        color={color}
        castShadow={castShadow}
        shadow-mapSize={[2048, 2048]}
      />
      <object3D ref={targetRef} position={targetPos} />
    </group>
  );
}

function SpotLight({ object }: { object: SceneObject }) {
  const lightRef = useRef<THREE.SpotLight>(null);
  const targetRef = useRef<THREE.Object3D>(null);
  const { intensity, color, castShadow, distance, decay, angle, penumbra } = object.lightProperties!;
  
  const direction = useMemo(() => {
    const euler = new THREE.Euler(
      THREE.MathUtils.degToRad(object.rotation.x),
      THREE.MathUtils.degToRad(object.rotation.y),
      THREE.MathUtils.degToRad(object.rotation.z)
    );
    const dir = new THREE.Vector3(0, -1, 0);
    dir.applyEuler(euler);
    return dir;
  }, [object.rotation]);
  
  const targetPos: [number, number, number] = useMemo(() => [
    object.position.x + direction.x * 5,
    object.position.y + direction.y * 5,
    object.position.z + direction.z * 5,
  ], [object.position, direction]);
  
  useEffect(() => {
    if (lightRef.current && targetRef.current) {
      lightRef.current.target = targetRef.current;
    }
  }, []);
  
  return (
    <group>
      <spotLight
        ref={lightRef}
        position={[object.position.x, object.position.y, object.position.z]}
        intensity={intensity}
        color={color}
        castShadow={castShadow}
        distance={distance}
        decay={decay}
        angle={angle}
        penumbra={penumbra}
      />
      <object3D ref={targetRef} position={targetPos} />
    </group>
  );
}

function SceneLight({ object, isSelected }: { object: SceneObject; isSelected: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const { activeTool, setPosition, setRotation } = useEditorStore();
  
  if (!object.visible || !object.lightProperties) return null;
  
  const { color } = object.lightProperties;
  const transformMode = activeTool === "select" ? undefined : activeTool;
  
  const direction = useMemo(() => {
    const euler = new THREE.Euler(
      THREE.MathUtils.degToRad(object.rotation.x),
      THREE.MathUtils.degToRad(object.rotation.y),
      THREE.MathUtils.degToRad(object.rotation.z)
    );
    const dir = new THREE.Vector3(0, -1, 0);
    dir.applyEuler(euler);
    return dir;
  }, [object.rotation]);
  
  const renderLight = () => {
    switch (object.type) {
      case "pointLight":
        return <PointLight object={object} />;
      case "directionalLight":
        return <DirectionalLight object={object} />;
      case "spotLight":
        return <SpotLight object={object} />;
      case "ambientLight":
        return <ambientLight intensity={object.lightProperties!.intensity} color={object.lightProperties!.color} />;
      default:
        return null;
    }
  };
  
  const showDirectionIndicator = object.type === "directionalLight" || object.type === "spotLight";
  
  return (
    <>
      {renderLight()}
      <group
        ref={groupRef}
        position={[object.position.x, object.position.y, object.position.z]}
        rotation={[
          THREE.MathUtils.degToRad(object.rotation.x),
          THREE.MathUtils.degToRad(object.rotation.y),
          THREE.MathUtils.degToRad(object.rotation.z),
        ]}
      >
        <mesh scale={[0.15, 0.15, 0.15]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial 
            color={color} 
            wireframe={!isSelected}
            transparent
            opacity={isSelected ? 1 : 0.5}
          />
        </mesh>
        {showDirectionIndicator && (
          <arrowHelper args={[new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 0, 0), 0.5, color, 0.1, 0.08]} />
        )}
      </group>
      {isSelected && groupRef.current && transformMode && (
        <TransformControls
          object={groupRef.current}
          mode={transformMode}
          onObjectChange={() => {
            if (groupRef.current) {
              const p = groupRef.current.position;
              const r = groupRef.current.rotation;
              
              if (transformMode === "translate") {
                setPosition(object.id, { x: p.x, y: p.y, z: p.z });
              } else if (transformMode === "rotate") {
                setRotation(object.id, {
                  x: THREE.MathUtils.radToDeg(r.x),
                  y: THREE.MathUtils.radToDeg(r.y),
                  z: THREE.MathUtils.radToDeg(r.z),
                });
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
  
  if (isLightType(object.type)) {
    return (
      <group onClick={(e) => { e.stopPropagation(); selectObject(object.id); }}>
        <SceneLight object={object} isSelected={isSelected} />
      </group>
    );
  }
  
  return (
    <group onClick={(e) => { e.stopPropagation(); selectObject(object.id); }}>
      <SceneMesh object={object} isSelected={isSelected} />
    </group>
  );
}

function Scene() {
  const { objects, selectObject } = useEditorStore();
  
  const hasUserLights = objects.some((o) => isLightType(o.type) && o.visible);
  
  return (
    <>
      {!hasUserLights && (
        <>
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          <directionalLight position={[-10, -10, -5]} intensity={0.3} />
        </>
      )}
      
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
  const { camera } = useEditorStore();
  
  return (
    <div className="w-full h-full bg-[#1a1a1a]" data-testid="viewport-container">
      <Canvas
        camera={{ 
          position: [camera.position.x, camera.position.y, camera.position.z], 
          fov: camera.fov 
        }}
        gl={{ antialias: true, alpha: false }}
        shadows
      >
        <color attach="background" args={["#1a1a1a"]} />
        <Scene />
        <CameraController />
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
