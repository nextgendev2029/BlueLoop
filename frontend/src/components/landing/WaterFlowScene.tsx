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

    // 1. WebGL Initialization with transparent background
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

    const width = container.clientWidth || window.innerWidth || 1200;
    const height = container.clientHeight || 700;

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // 100% transparent canvas
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    // 2. Scene and Camera positioned for full-background composition
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(1.2, 4.8, 11.5);
    camera.lookAt(1.2, 0, 0);

    // 3. Marine and Water Lighting (Restrained Cyan and Deep Ocean)
    const ambientLight = new THREE.AmbientLight(0x0d283c, 1.4);
    scene.add(ambientLight);

    const cyanLight = new THREE.DirectionalLight(0x16b8d4, 2.2);
    cyanLight.position.set(6, 10, 8);
    scene.add(cyanLight);

    const deepBlueLight = new THREE.DirectionalLight(0x1677b8, 1.6);
    deepBlueLight.position.set(-6, 6, -4);
    scene.add(deepBlueLight);

    // 4. Subtle Undulating Water Surface Wave Plane
    const gridX = 64;
    const gridY = 48;
    const planeGeo = new THREE.PlaneGeometry(26, 16, gridX, gridY);
    planeGeo.rotateX(-Math.PI / 2.35);

    const posAttr = planeGeo.attributes.position;
    const initialPositions = posAttr.array.slice() as Float32Array;

    const waterMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x1677b8,
      emissive: 0x07283c,
      emissiveIntensity: 0.2,
      roughness: 0.2,
      metalness: 0.1,
      transmission: 0.75,
      transparent: true,
      opacity: 0.26,
      wireframe: false,
      flatShading: false,
    });

    const waterMesh = new THREE.Mesh(planeGeo, waterMaterial);
    waterMesh.position.set(2.0, -1.2, -1.0);
    scene.add(waterMesh);

    // Secondary ethereal wave ribbon for depth
    const ribbonGeo = new THREE.PlaneGeometry(20, 6, 48, 16);
    ribbonGeo.rotateX(-Math.PI / 2.25);
    const ribbonMaterial = new THREE.MeshStandardMaterial({
      color: 0x16b8d4,
      roughness: 0.25,
      metalness: 0.2,
      transparent: true,
      opacity: 0.14,
      wireframe: false,
    });
    const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMaterial);
    ribbonMesh.position.set(2.5, -0.8, -2.0);
    scene.add(ribbonMesh);

    // 5. Closed-Loop Water Conduit (Conveyance from Treatment to Industrial Intake)
    const curvePoints = [
      new THREE.Vector3(-4.5, 0.8, -2.8), // Tertiary STP Source
      new THREE.Vector3(-1.0, 1.5, -1.0), // Chemical screening conduit
      new THREE.Vector3(2.5, 0.7, 0.5),   // Conveyance trunk line
      new THREE.Vector3(5.5, -0.3, 1.8),  // Industrial intake terminal
      new THREE.Vector3(3.5, -1.6, -0.6), // Recirculation return
      new THREE.Vector3(-1.5, -1.2, -2.2),// Return balance
    ];

    const splineCurve = new THREE.CatmullRomCurve3(curvePoints, true); // Closed loop

    const tubeGeo = new THREE.TubeGeometry(splineCurve, 96, 0.18, 16, true);
    const tubeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x1677b8,
      emissive: 0x09344d,
      emissiveIntensity: 0.25,
      roughness: 0.15,
      metalness: 0.15,
      transmission: 0.7,
      transparent: true,
      opacity: 0.38,
      wireframe: false,
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMaterial);
    scene.add(tubeMesh);

    const outerTubeGeo = new THREE.TubeGeometry(splineCurve, 72, 0.3, 12, true);
    const outerMaterial = new THREE.MeshStandardMaterial({
      color: 0x16b8d4,
      roughness: 0.25,
      metalness: 0.2,
      transparent: true,
      opacity: 0.12,
      wireframe: false,
    });
    const outerMesh = new THREE.Mesh(outerTubeGeo, outerMaterial);
    scene.add(outerMesh);

    // 6. Directed Flow Particles (Following the loop trajectory)
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particleProgress = new Float32Array(particleCount);
    const particleSpeed = new Float32Array(particleCount);

    const colorCyan = new THREE.Color(0x16b8d4);
    const colorWater = new THREE.Color(0x1677b8);

    for (let i = 0; i < particleCount; i++) {
      particleProgress[i] = Math.random();
      particleSpeed[i] = 0.0014 + Math.random() * 0.002;

      const pt = splineCurve.getPoint(particleProgress[i]);
      const scatter = 0.18;
      particlePositions[i * 3] = pt.x + (Math.random() - 0.5) * scatter;
      particlePositions[i * 3 + 1] = pt.y + (Math.random() - 0.5) * scatter;
      particlePositions[i * 3 + 2] = pt.z + (Math.random() - 0.5) * scatter;

      const mix = colorWater.clone().lerp(colorCyan, Math.random());
      particleColors[i * 3] = mix.r;
      particleColors[i * 3 + 1] = mix.g;
      particleColors[i * 3 + 2] = mix.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.14,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(particleGeo, particleMaterial);
    scene.add(particleSystem);

    // 7. Facility Markers: Source (Tertiary STP) & Destination (Industrial Intake)
    const markersGroup = new THREE.Group();

    const createBeacon = (position: THREE.Vector3, colorHex: number) => {
      const g = new THREE.Group();
      g.position.copy(position);

      const core = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 16, 16),
        new THREE.MeshBasicMaterial({ color: colorHex })
      );
      g.add(core);

      const halo = new THREE.Mesh(
        new THREE.RingGeometry(0.22, 0.34, 32),
        new THREE.MeshBasicMaterial({
          color: colorHex,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.4,
        })
      );
      halo.rotateX(-Math.PI / 2);
      g.add(halo);

      return g;
    };

    const sourceBeacon = createBeacon(curvePoints[0], 0x1677b8);
    const sinkBeacon = createBeacon(curvePoints[3], 0x16b8d4);
    markersGroup.add(sourceBeacon);
    markersGroup.add(sinkBeacon);
    scene.add(markersGroup);

    // 8. Subtle Parallax Response
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = x * 0.25;
      targetY = y * 0.15;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 9. Resize Handling
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth || 1200;
      const h = container.clientHeight || 700;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 10. Animation Render Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();
      const speedFactor = prefersReducedMotion ? 0.2 : 1.0;
      const t = elapsed * speedFactor;

      // Animate water surface wave ripples
      const currentPos = posAttr.array as Float32Array;
      for (let i = 0; i < currentPos.length; i += 3) {
        const ox = initialPositions[i];
        const oy = initialPositions[i + 1];
        const wave1 = Math.sin(ox * 0.4 + t * 1.2) * 0.22;
        const wave2 = Math.cos(oy * 0.5 + t * 0.9) * 0.18;
        const ripple = Math.sin((ox + oy) * 0.25 + t * 1.5) * 0.08;
        currentPos[i + 2] = initialPositions[i + 2] + wave1 + wave2 + ripple;
      }
      posAttr.needsUpdate = true;
      planeGeo.computeVertexNormals();

      // Ribbon undulating motion
      ribbonMesh.position.y = -0.8 + Math.sin(t * 1.1) * 0.06;

      // Animate flowing fluid particles along spline
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        particleProgress[i] = (particleProgress[i] + particleSpeed[i] * speedFactor) % 1.0;
        const pt = splineCurve.getPoint(particleProgress[i]);
        const pulse = Math.sin(t * 1.8 + particleProgress[i] * Math.PI * 4) * 0.03;
        positions[i * 3] = pt.x * (1 + pulse);
        positions[i * 3 + 1] = pt.y * (1 + pulse);
        positions[i * 3 + 2] = pt.z * (1 + pulse);
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Beacon halo breath animation
      sourceBeacon.children[1].scale.setScalar(1 + Math.sin(t * 2.2) * 0.14);
      sinkBeacon.children[1].scale.setScalar(1 + Math.cos(t * 2.2) * 0.14);

      // Camera parallax
      mouseX += (targetX - mouseX) * 0.04;
      mouseY += (targetY - mouseY) * 0.04;
      camera.position.x = 1.2 + mouseX * 1.5;
      camera.position.y = 4.8 + mouseY * 0.8;
      camera.lookAt(1.2, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // 11. Complete GPU Resource Disposal on Unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      planeGeo.dispose();
      waterMaterial.dispose();
      ribbonGeo.dispose();
      ribbonMaterial.dispose();
      tubeGeo.dispose();
      tubeMaterial.dispose();
      outerTubeGeo.dispose();
      outerMaterial.dispose();
      particleGeo.dispose();
      particleMaterial.dispose();

      markersGroup.traverse((child) => {
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
      <div className={`relative overflow-hidden flex items-center justify-center ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-water-100/40 via-aqua-50/20 to-transparent" />
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
