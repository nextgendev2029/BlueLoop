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
    camera.position.set(0.6, 4.4, 11.2);
    camera.lookAt(0.6, 0, 0);

    // 3. Marine and Water Lighting (Restrained Cyan, Deep Ocean, and Ledger Aqua)
    const ambientLight = new THREE.AmbientLight(0x0d283c, 1.4);
    scene.add(ambientLight);

    const cyanLight = new THREE.DirectionalLight(0x16b8d4, 2.2);
    cyanLight.position.set(5, 9, 7);
    scene.add(cyanLight);

    const deepBlueLight = new THREE.DirectionalLight(0x1677b8, 1.6);
    deepBlueLight.position.set(-6, 6, -4);
    scene.add(deepBlueLight);

    // 4. Subtle Undulating Liquid Water Surface Plane (Subtle Depth)
    const gridX = 64;
    const gridY = 48;
    const planeGeo = new THREE.PlaneGeometry(28, 15, gridX, gridY);
    planeGeo.rotateX(-Math.PI / 2.35);

    const posAttr = planeGeo.attributes.position;
    const initialPositions = posAttr.array.slice() as Float32Array;

    const waterMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x1677b8,
      emissive: 0x07283c,
      emissiveIntensity: 0.18,
      roughness: 0.22,
      metalness: 0.1,
      transmission: 0.8,
      transparent: true,
      opacity: 0.22,
      wireframe: false,
      flatShading: false,
    });

    const waterMesh = new THREE.Mesh(planeGeo, waterMaterial);
    waterMesh.position.set(1.5, -1.3, -1.0);
    scene.add(waterMesh);

    // Secondary ethereal wave ribbon for depth
    const ribbonGeo = new THREE.PlaneGeometry(22, 5, 48, 16);
    ribbonGeo.rotateX(-Math.PI / 2.25);
    const ribbonMaterial = new THREE.MeshStandardMaterial({
      color: 0x16b8d4,
      roughness: 0.25,
      metalness: 0.2,
      transparent: true,
      opacity: 0.12,
      wireframe: false,
    });
    const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMaterial);
    ribbonMesh.position.set(2.0, -0.9, -2.0);
    scene.add(ribbonMesh);

    // 5. Open Industrial Water-Reuse Trajectory (Sequence: Source -> Screening -> Transport -> Intake -> Ledger)
    // Clear directional narrative: NOT a circular donut pipe!
    const streamPoints = [
      new THREE.Vector3(-6.2, 1.8, -3.2), // 1. Tertiary Treatment Plant Outflow
      new THREE.Vector3(-2.6, 1.3, -1.4), // 2. Chemical Quality Screening Checkpoint
      new THREE.Vector3(0.8, 0.6, 0.2),   // 3. Logistics Transport Conveyance
      new THREE.Vector3(4.2, -0.2, 1.2),  // 4. Industrial Cooling Intake
      new THREE.Vector3(7.0, -1.0, 2.2),  // 5. Custody Ledger & Impact Record
    ];

    // Open curve (false = directional flow from source to destination)
    const streamCurve = new THREE.CatmullRomCurve3(streamPoints, false);

    // Fluid conduit ribbon
    const tubeGeo = new THREE.TubeGeometry(streamCurve, 96, 0.14, 16, false);
    const tubeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x1677b8,
      emissive: 0x09344d,
      emissiveIntensity: 0.22,
      roughness: 0.18,
      metalness: 0.12,
      transmission: 0.72,
      transparent: true,
      opacity: 0.34,
      wireframe: false,
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMaterial);
    scene.add(tubeMesh);

    // Outer luminous halo
    const outerTubeGeo = new THREE.TubeGeometry(streamCurve, 72, 0.24, 12, false);
    const outerMaterial = new THREE.MeshStandardMaterial({
      color: 0x16b8d4,
      roughness: 0.25,
      metalness: 0.2,
      transparent: true,
      opacity: 0.1,
      wireframe: false,
    });
    const outerMesh = new THREE.Mesh(outerTubeGeo, outerMaterial);
    scene.add(outerMesh);

    // 6. Directional Flow Particles (Moving sequentially from Source to Destination)
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particleProgress = new Float32Array(particleCount);
    const particleSpeed = new Float32Array(particleCount);

    const colorSource = new THREE.Color(0x1677b8);
    const colorScreening = new THREE.Color(0x16b8d4);
    const colorIntake = new THREE.Color(0x24b8c7);
    const colorLedger = new THREE.Color(0x168779);

    for (let i = 0; i < particleCount; i++) {
      particleProgress[i] = Math.random();
      particleSpeed[i] = 0.0016 + Math.random() * 0.0022;

      const pt = streamCurve.getPoint(particleProgress[i]);
      const scatter = 0.14;
      particlePositions[i * 3] = pt.x + (Math.random() - 0.5) * scatter;
      particlePositions[i * 3 + 1] = pt.y + (Math.random() - 0.5) * scatter;
      particlePositions[i * 3 + 2] = pt.z + (Math.random() - 0.5) * scatter;

      // Color transition reflecting the industrial transformation along the stream
      const p = particleProgress[i];
      let col = colorSource.clone();
      if (p < 0.3) {
        col = colorSource.clone().lerp(colorScreening, p / 0.3);
      } else if (p < 0.7) {
        col = colorScreening.clone().lerp(colorIntake, (p - 0.3) / 0.4);
      } else {
        col = colorIntake.clone().lerp(colorLedger, (p - 0.7) / 0.3);
      }

      particleColors[i * 3] = col.r;
      particleColors[i * 3 + 1] = col.g;
      particleColors[i * 3 + 2] = col.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.13,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(particleGeo, particleMaterial);
    scene.add(particleSystem);

    // 7. Industrial Water Sequence Markers (5 Nodes: Treatment, Screening, Transport, Intake, Ledger)
    const markersGroup = new THREE.Group();

    const createSequenceNode = (
      position: THREE.Vector3,
      colorHex: number,
      haloRadius: number = 0.28
    ) => {
      const g = new THREE.Group();
      g.position.copy(position);

      const core = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 16, 16),
        new THREE.MeshBasicMaterial({ color: colorHex })
      );
      g.add(core);

      const halo = new THREE.Mesh(
        new THREE.RingGeometry(haloRadius * 0.7, haloRadius, 32),
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

    // 1. Treatment Source Node (Marine Blue)
    const treatmentNode = createSequenceNode(streamPoints[0], 0x1677b8, 0.32);
    // 2. Chemical Screening Gatekeeper Node (Cyan)
    const screeningNode = createSequenceNode(streamPoints[1], 0x16b8d4, 0.30);
    // 3. Logistics Transport Junction (Aqua)
    const transportNode = createSequenceNode(streamPoints[2], 0x24b8c7, 0.28);
    // 4. Industrial Cooling Intake Node (Navy/Teal)
    const intakeNode = createSequenceNode(streamPoints[3], 0x123b56, 0.30);
    // 5. Audit Provenance Ledger Node (Emerald Teal)
    const ledgerNode = createSequenceNode(streamPoints[4], 0x168779, 0.34);

    markersGroup.add(treatmentNode);
    markersGroup.add(screeningNode);
    markersGroup.add(transportNode);
    markersGroup.add(intakeNode);
    markersGroup.add(ledgerNode);
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
      targetX = x * 0.22;
      targetY = y * 0.14;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 9. Responsive Resize Handling
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth || 1200;
      const h = container.clientHeight || 700;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 10. Animation Render Loop (Continuous Directional Industrial Water Story)
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
        const wave1 = Math.sin(ox * 0.38 + t * 1.1) * 0.18;
        const wave2 = Math.cos(oy * 0.46 + t * 0.85) * 0.15;
        const ripple = Math.sin((ox + oy) * 0.22 + t * 1.4) * 0.06;
        currentPos[i + 2] = initialPositions[i + 2] + wave1 + wave2 + ripple;
      }
      posAttr.needsUpdate = true;
      planeGeo.computeVertexNormals();

      // Ribbon undulating motion
      ribbonMesh.position.y = -0.9 + Math.sin(t * 1.0) * 0.05;

      // Animate flowing fluid particles strictly in sequence: Source -> Screening -> Transport -> Intake -> Ledger
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        particleProgress[i] = (particleProgress[i] + particleSpeed[i] * speedFactor) % 1.0;
        const pt = streamCurve.getPoint(particleProgress[i]);
        const pulse = Math.sin(t * 1.6 + particleProgress[i] * Math.PI * 4) * 0.025;
        positions[i * 3] = pt.x * (1 + pulse);
        positions[i * 3 + 1] = pt.y * (1 + pulse);
        positions[i * 3 + 2] = pt.z * (1 + pulse);
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Node halo breathing animations
      treatmentNode.children[1].scale.setScalar(1 + Math.sin(t * 2.0) * 0.12);
      screeningNode.children[1].scale.setScalar(1 + Math.cos(t * 2.2) * 0.14);
      transportNode.children[1].scale.setScalar(1 + Math.sin(t * 2.4) * 0.10);
      intakeNode.children[1].scale.setScalar(1 + Math.cos(t * 2.0) * 0.12);
      ledgerNode.children[1].scale.setScalar(1 + Math.sin(t * 2.6) * 0.16);

      // Camera parallax
      mouseX += (targetX - mouseX) * 0.04;
      mouseY += (targetY - mouseY) * 0.04;
      camera.position.x = 0.6 + mouseX * 1.4;
      camera.position.y = 4.4 + mouseY * 0.7;
      camera.lookAt(0.6, 0, 0);

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
