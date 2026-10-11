import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface WaterFlowSceneProps {
  className?: string;
}

export const WaterFlowScene: React.FC<WaterFlowSceneProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webGLSupported, setWebGLSupported] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. WebGL Support Test
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebGLSupported(false);
      return;
    }

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    // 2. Scene and Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 7, 12);
    camera.lookAt(0, 0, 0);

    // 3. Lighting (Restrained water blue & aqua tones)
    const ambientLight = new THREE.AmbientLight(0x123b56, 1.2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x24b8c7, 2.0);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    const blueBackLight = new THREE.DirectionalLight(0x1677b8, 1.5);
    blueBackLight.position.set(-5, 6, -5);
    scene.add(blueBackLight);

    // 4. Flowing Water Plane Geometry
    const gridX = 40;
    const gridY = 40;
    const planeGeo = new THREE.PlaneGeometry(16, 12, gridX, gridY);
    planeGeo.rotateX(-Math.PI / 2.3);

    // Store base vertex positions
    const posAttr = planeGeo.attributes.position;
    const initialPositions = posAttr.array.slice() as Float32Array;

    const waterMaterial = new THREE.MeshStandardMaterial({
      color: 0x1677b8,
      roughness: 0.25,
      metalness: 0.1,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });

    const waterMesh = new THREE.Mesh(planeGeo, waterMaterial);
    waterMesh.position.set(0, -0.5, 0);
    scene.add(waterMesh);

    // 5. Interconnected Flow Particles (Moving from Treatment Plant to Intake Demand)
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    const colorAqua = new THREE.Color(0x24b8c7);
    const colorOcean = new THREE.Color(0x1677b8);

    for (let i = 0; i < particleCount; i++) {
      // Curve coordinates across the plane
      const t = Math.random();
      const x = (t - 0.5) * 14;
      const z = (Math.random() - 0.5) * 8;
      const y = Math.sin(t * Math.PI) * 1.5 + Math.random() * 0.4;

      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;

      const mixColor = colorOcean.clone().lerp(colorAqua, Math.random());
      particleColors[i * 3] = mixColor.r;
      particleColors[i * 3 + 1] = mixColor.g;
      particleColors[i * 3 + 2] = mixColor.b;

      particleSpeeds[i] = 0.02 + Math.random() * 0.03;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(particleGeo, particleMaterial);
    scene.add(particleSystem);

    // 6. Beacon Nodes (Supplier Source & Buyer Demands)
    const nodeGroup = new THREE.Group();

    const createBeacon = (x: number, y: number, z: number, colorHex: number) => {
      const beacon = new THREE.Group();
      beacon.position.set(x, y, z);

      // Core sphere
      const coreGeo = new THREE.SphereGeometry(0.2, 16, 16);
      const coreMat = new THREE.MeshBasicMaterial({ color: colorHex });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      beacon.add(coreMesh);

      // Outer ring
      const ringGeo = new THREE.RingGeometry(0.3, 0.38, 32);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      beacon.add(ringMesh);

      return beacon;
    };

    // Treatment Facility Node (Left)
    const sourceNode = createBeacon(-5, 0.4, 0, 0x1677b8);
    nodeGroup.add(sourceNode);

    // Consumer Intake Node (Right)
    const demandNode = createBeacon(5, 0.4, 0, 0x24b8c7);
    nodeGroup.add(demandNode);

    // Intermediate CETP Hub (Center)
    const hubNode = createBeacon(0, 0.8, -1.5, 0x174d3a);
    nodeGroup.add(hubNode);

    scene.add(nodeGroup);

    // 7. Mouse Interaction (Restrained subtle parallax)
    let mouseX = 0;
    let mouseY = 0;
    let targetCameraX = 0;
    let targetCameraY = 7;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = nx * 0.8;
      mouseY = ny * 0.4;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 8. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Camera smooth damping
      targetCameraX = mouseX * 1.5;
      targetCameraY = 7 + mouseY * 0.8;
      camera.position.x += (targetCameraX - camera.position.x) * 0.05;
      camera.position.y += (targetCameraY - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      if (!prefersReducedMotion) {
        // Animate water ripples on vertices
        const positions = posAttr.array as Float32Array;
        for (let i = 0; i < posAttr.count; i++) {
          const u = initialPositions[i * 3];
          const v = initialPositions[i * 3 + 1];
          const wave =
            Math.sin(u * 0.8 + elapsedTime * 1.5) * 0.25 +
            Math.cos(v * 0.6 + elapsedTime * 1.2) * 0.2;
          positions[i * 3 + 2] = initialPositions[i * 3 + 2] + wave;
        }
        posAttr.needsUpdate = true;

        // Animate particles flowing across supply -> demand
        const pPos = particleGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          pPos[i * 3] += particleSpeeds[i];
          if (pPos[i * 3] > 7) {
            pPos[i * 3] = -7;
          }
          // gentle harmonic bobbing
          pPos[i * 3 + 1] = Math.sin(pPos[i * 3] * 0.4 + elapsedTime) * 0.6 + 0.3;
        }
        particleGeo.attributes.position.needsUpdate = true;

        // Subtle beacon ring pulsing
        nodeGroup.children.forEach((beacon, idx) => {
          const ring = beacon.children[1];
          if (ring) {
            const scale = 1 + Math.sin(elapsedTime * 2 + idx * 1.5) * 0.15;
            ring.scale.set(scale, scale, scale);
          }
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Handling
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // 10. Complete Resource Cleanup on Unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      planeGeo.dispose();
      waterMaterial.dispose();
      particleGeo.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[420px] overflow-hidden ${className}`}
      aria-label="3D Visualization of Industrial Water Flow and Demand Allocation"
    >
      {!webGLSupported && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#E8F5F8] via-[#FAFBF9] to-[#DCE7EB] p-8 text-center">
          <div className="max-w-md space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#1677B8]">
              Water Flow Network
            </span>
            <p className="text-sm text-[#637680]">
              WebGL unavailable in current browser. BlueLoop deterministic quality & allocation logic is active.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
