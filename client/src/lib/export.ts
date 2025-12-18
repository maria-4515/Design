import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import type { SceneObject } from "@shared/schema";

export async function exportSceneToGLTF(
  objects: SceneObject[],
  sceneName: string,
  binary: boolean = false
): Promise<void> {
  // Create a Three.js scene from the objects
  const scene = new THREE.Scene();
  
  objects.forEach((obj) => {
    if (!obj.visible) return;
    
    let geometry: THREE.BufferGeometry;
    
    switch (obj.type) {
      case "cube":
        geometry = new THREE.BoxGeometry(1, 1, 1);
        break;
      case "sphere":
        geometry = new THREE.SphereGeometry(0.5, 32, 32);
        break;
      case "cylinder":
        geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
        break;
      case "plane":
        geometry = new THREE.PlaneGeometry(2, 2);
        break;
      case "cone":
        geometry = new THREE.ConeGeometry(0.5, 1, 32);
        break;
      case "torus":
        geometry = new THREE.TorusGeometry(0.5, 0.2, 16, 32);
        break;
      default:
        geometry = new THREE.BoxGeometry(1, 1, 1);
    }
    
    const material = new THREE.MeshStandardMaterial({
      color: obj.material.color,
      opacity: obj.material.opacity,
      transparent: obj.material.opacity < 1,
      metalness: obj.material.metalness,
      roughness: obj.material.roughness,
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = obj.name;
    mesh.position.set(obj.position.x, obj.position.y, obj.position.z);
    mesh.rotation.set(
      THREE.MathUtils.degToRad(obj.rotation.x),
      THREE.MathUtils.degToRad(obj.rotation.y),
      THREE.MathUtils.degToRad(obj.rotation.z)
    );
    mesh.scale.set(obj.scale.x, obj.scale.y, obj.scale.z);
    
    scene.add(mesh);
  });
  
  // Add lights to the exported scene
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(10, 10, 5);
  scene.add(directionalLight);
  
  // Export using GLTFExporter
  const exporter = new GLTFExporter();
  
  return new Promise((resolve, reject) => {
    exporter.parse(
      scene,
      (result) => {
        let blob: Blob;
        let filename: string;
        
        if (binary) {
          // GLB (binary)
          blob = new Blob([result as ArrayBuffer], { type: "application/octet-stream" });
          filename = `${sceneName}.glb`;
        } else {
          // GLTF (JSON)
          const json = JSON.stringify(result, null, 2);
          blob = new Blob([json], { type: "application/json" });
          filename = `${sceneName}.gltf`;
        }
        
        // Download the file
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        resolve();
      },
      (error) => {
        reject(error);
      },
      { binary }
    );
  });
}
