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

    const width = container.clientWidth || 560;
    const height = container.clientHeight || 480;

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // 100% transparent canvas
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 2. Scene and Camera (Focused strictly on the right composition)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 4.2, 9.5);
    camera.lookAt(0, 0, 0);

    // 3. Marine and Water Lighting
    const ambientLight = new THREE.AmbientLight(0x10354a, 1.8);
    scene.add(ambientLight);

    const cyanLight = new THREE.DirectionalLight(0x16b8d4, 2.6);
    cyanLight.position.set(5, 8, 6);
    scene.add(cyanLight);

    const deepBlueLight = new THREE.DirectionalLight(0x123b56, 1.6);
    deepBlueLight.position.set(-5, 4, -3);
    scene.add(deepBlueLight);

    // 4. Closed-Loop Water Curve (Conveyance from Treatment to Industrial Intake)
    const curvePoints = [
      new THREE.Vector3(-3.2, 1.6, -1.8), // Treatment Source
      new THREE.Vector3(-1.0, 2.2, 0.2),  // Upward conduit
      new THREE.Vector3(1.8, 0.8, 1.2),   // Intermediate screening
      new THREE.Vector3(3.0, -1.2, 0.4),  // Industrial Intake
      new THREE.Vector3(1.2, -2.0, -1.0), // Return circulation
      new THREE.Vector3(-1.8, -1.0, -1.6),// Closed-loop balance
    ];

    const splineCurve = new THREE.CatmullRomCurve3(curvePoints, true); // true = closed loop

    // 5. Smooth Water Fluid Ribbon
    const tubeGeo = new THREE.TubeGeometry(splineCurve, 84, 0.24, 16, true);
    const tubeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x1677b8,
      emissive: 0x0a283a,
      emissiveIntensity: 0.35,
      roughness: 0.12,
      metalness: 0.15,
      transmission: 0.75,
      transparent: true,
      opacity: 0.65,
      wireframe: false,
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMaterial);
    scene.add(tubeMesh);

    // Second ethereal outer ribbon for organic wave surface
    const outerTubeGeo = new THREE.TubeGeometry(splineCurve, 72, 0.36, 12, true);
    const outerMaterial = new THREE.MeshStandardMaterial({
      color: 0x16b8d4,
      roughness: 0.25,
      metalness: 0.2,
      transparent: true,
      opacity: 0.2,
      wireframe: false,
    });
    const outerMesh = new THREE.Mesh(outerTubeGeo, outerMaterial);
    scene.add(outerMesh);

    // 6. Directed Flow Particles (Following the loop trajectory)
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particleProgress = new Float32Array(particleCount);
    const particleSpeed = new Float32Array(particleCount);

    const colorCyan = new THREE.Color(0x16b8d4);
    const colorWater = new THREE.Color(0x1677b8);

    for (let i = 0; i < particleCount; i++) {
      particleProgress[i] = Math.random();
      particleSpeed[i] = 0.0015 + Math.random() * 0.0022;

      const pt = splineCurve.getPoint(particleProgress[i]);
      const scatter = 0.15;
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
      opacity: 0.85,
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
        new THREE.SphereGeometry(0.18, 16, 16),
        new THREE.MeshBasicMaterial({ color: colorHex })
      );
      g.add(core);

      const halo = new THREE.Mesh(
        new THREE.RingGeometry(0.24, 0.36, 32),
        new THREE.MeshBasicMaterial({
          color: colorHex,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.45,
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
      targetX = x * 0.3;
      targetY = y * 0.2;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 9. Resize Handling
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 560;
      const h = container.clientHeight || 480;
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

      // Rotate the entire closed fluid loop gently
      tubeMesh.rotation.y = t * 0.08;
      outerMesh.rotation.y = t * 0.08;
      particleSystem.rotation.y = t * 0.08;
      markersGroup.rotation.y = t * 0.08;

      // Animate flowing fluid particles
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        particleProgress[i] = (particleProgress[i] + particleSpeed[i] * speedFactor) % 1.0;
        const pt = splineCurve.getPoint(particleProgress[i]);

        // Add subtle radial pulse
        const pulse = Math.sin(t * 2.0 + particleProgress[i] * Math.PI * 6) * 0.04;
        positions[i * 3] = pt.x * (1 + pulse);
        positions[i * 3 + 1] = pt.y * (1 + pulse);
        positions[i * 3 + 2] = pt.z * (1 + pulse);
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Beacon halo breath animation
      sourceBeacon.children[1].scale.setScalar(1 + Math.sin(t * 2.4) * 0.16);
      sinkBeacon.children[1].scale.setScalar(1 + Math.cos(t * 2.4) * 0.16);

      // Camera parallax
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;
      camera.position.x = mouseX * 1.5;
      camera.position.y = 4.2 + mouseY * 0.8;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // 11. Complete Resource Disposal on Unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

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
        <div className="w-64 h-64 rounded-full border border-water-300/40 bg-gradient-to-br from-water-100/30 via-aqua-50/20 to-transparent flex items-center justify-center">
          <div className="w-40 h-40 rounded-full border border-water-400/50 border-dashed animate-spin" />
        </div>
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
