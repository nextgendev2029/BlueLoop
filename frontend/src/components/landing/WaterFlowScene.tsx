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
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 2. Scene and Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 5, 11);
    camera.lookAt(1, 0, 0);

    // 3. Lighting (Ocean Blue and Aqua Luster)
    const ambientLight = new THREE.AmbientLight(0x0d2b40, 1.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x24b8c7, 2.4);
    directionalLight.position.set(6, 12, 8);
    scene.add(directionalLight);

    const blueBackLight = new THREE.DirectionalLight(0x1677b8, 1.8);
    blueBackLight.position.set(-6, 6, -4);
    scene.add(blueBackLight);

    // 4. Smooth Flowing Water Surface (No harsh wireframe grid)
    const gridX = 64;
    const gridY = 48;
    const planeGeo = new THREE.PlaneGeometry(18, 14, gridX, gridY);
    planeGeo.rotateX(-Math.PI / 2.3);

    const posAttr = planeGeo.attributes.position;
    const initialPositions = posAttr.array.slice() as Float32Array;

    // Smooth semi-transparent water material
    const waterMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x1677b8,
      emissive: 0x093a54,
      emissiveIntensity: 0.25,
      roughness: 0.15,
      metalness: 0.1,
      transmission: 0.6,
      transparent: true,
      opacity: 0.45,
      wireframe: false,
      flatShading: false,
    });

    const waterMesh = new THREE.Mesh(planeGeo, waterMaterial);
    waterMesh.position.set(1.5, -1.0, -0.5);
    scene.add(waterMesh);

    // Second ethereal surface ribbon for depth
    const ribbonGeo = new THREE.PlaneGeometry(16, 5, 48, 16);
    ribbonGeo.rotateX(-Math.PI / 2.2);
    const ribbonMaterial = new THREE.MeshStandardMaterial({
      color: 0x24b8c7,
      roughness: 0.2,
      metalness: 0.3,
      transparent: true,
      opacity: 0.25,
      wireframe: false,
    });
    const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMaterial);
    ribbonMesh.position.set(2.0, -0.6, -1.5);
    scene.add(ribbonMesh);

    // 5. Flowing Water Conduit Stream Particles
    // Particles flow along a graceful organic trajectory connecting source to destination
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particleProgress = new Float32Array(particleCount);
    const particleSpeed = new Float32Array(particleCount);

    const colorAqua = new THREE.Color(0x24b8c7);
    const colorWater = new THREE.Color(0x1677b8);

    // Define 3D spline curve for the primary fluid conveyance
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4, 0.4, -2.5),
      new THREE.Vector3(-1.5, 0.9, -0.8),
      new THREE.Vector3(1.5, 0.3, 0.5),
      new THREE.Vector3(4.5, -0.2, 2.0),
    ]);

    for (let i = 0; i < particleCount; i++) {
      particleProgress[i] = Math.random();
      particleSpeed[i] = 0.0018 + Math.random() * 0.0025;

      const point = curve.getPoint(particleProgress[i]);
      // Small radial scatter around spline
      const scatter = 0.3;
      particlePositions[i * 3] = point.x + (Math.random() - 0.5) * scatter;
      particlePositions[i * 3 + 1] = point.y + (Math.random() - 0.5) * scatter * 0.5;
      particlePositions[i * 3 + 2] = point.z + (Math.random() - 0.5) * scatter;

      const mix = colorWater.clone().lerp(colorAqua, Math.random());
      particleColors[i * 3] = mix.r;
      particleColors[i * 3 + 1] = mix.g;
      particleColors[i * 3 + 2] = mix.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(particleGeo, particleMaterial);
    scene.add(particleSystem);

    // 6. Subtle, non-intrusive facility marker beacons at the endpoints
    const nodeGroup = new THREE.Group();

    const createFacilityNode = (x: number, y: number, z: number, colorHex: number) => {
      const node = new THREE.Group();
      node.position.set(x, y, z);

      // Core soft sphere
      const sphereGeo = new THREE.SphereGeometry(0.14, 16, 16);
      const sphereMat = new THREE.MeshBasicMaterial({ color: colorHex });
      const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
      node.add(sphereMesh);

      // Soft halo ring
      const ringGeo = new THREE.RingGeometry(0.18, 0.24, 32);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.45,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      node.add(ringMesh);

      return node;
    };

    // Municipal Supplier origin (left-back)
    const sourceNode = createFacilityNode(-4, 0.4, -2.5, 0x1677b8);
    // Industrial Buyer intake (right-front)
    const intakeNode = createFacilityNode(4.5, -0.2, 2.0, 0x24b8c7);
    nodeGroup.add(sourceNode);
    nodeGroup.add(intakeNode);
    scene.add(nodeGroup);

    // 7. Mouse Parallax (Restrained)
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = x * 0.4;
      targetY = y * 0.25;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 8. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 9. Animation Render Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();
      const speedFactor = prefersReducedMotion ? 0.2 : 1.0;
      const t = elapsed * speedFactor;

      // 1. Procedural water surface waves
      const currentPos = posAttr.array as Float32Array;
      for (let i = 0; i < currentPos.length; i += 3) {
        const ox = initialPositions[i];
        const oy = initialPositions[i + 1];

        // Fluid undulating wave mathematics
        const wave1 = Math.sin(ox * 0.45 + t * 1.4) * 0.3;
        const wave2 = Math.cos(oy * 0.55 + t * 1.1) * 0.22;
        const ripple = Math.sin((ox + oy) * 0.3 + t * 1.8) * 0.12;

        currentPos[i + 2] = initialPositions[i + 2] + wave1 + wave2 + ripple;
      }
      posAttr.needsUpdate = true;
      planeGeo.computeVertexNormals();

      // 2. Animate secondary ribbon
      ribbonMesh.position.y = -0.6 + Math.sin(t * 1.2) * 0.08;

      // 3. Fluid conduit particles
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        particleProgress[i] = (particleProgress[i] + particleSpeed[i] * speedFactor) % 1.0;
        const p = curve.getPoint(particleProgress[i]);

        positions[i * 3] = p.x;
        positions[i * 3 + 1] = p.y + Math.sin(particleProgress[i] * Math.PI * 4 + t * 2) * 0.08;
        positions[i * 3 + 2] = p.z;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // 4. Subtle node pulsation
      sourceNode.children[1].scale.setScalar(1 + Math.sin(t * 2.5) * 0.15);
      intakeNode.children[1].scale.setScalar(1 + Math.cos(t * 2.5) * 0.15);

      // 5. Smooth camera parallax
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;
      camera.position.x = mouseX * 2.5;
      camera.position.y = 5 + mouseY * 1.5;
      camera.lookAt(1, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // 10. Comprehensive GPU Resource Cleanup on Unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      planeGeo.dispose();
      waterMaterial.dispose();
      ribbonGeo.dispose();
      ribbonMaterial.dispose();
      particleGeo.dispose();
      particleMaterial.dispose();

      nodeGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });

      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (!webGLSupported) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-water-100/30 via-aqua-50/20 to-transparent" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden pointer-events-none select-none ${className}`}
      aria-hidden="true"
    />
  );
};
