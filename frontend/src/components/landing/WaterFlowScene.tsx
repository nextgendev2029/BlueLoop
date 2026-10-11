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
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    // 2. Scene and Camera positioned to overlay the cinematic water landscape
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 10.5);
    camera.lookAt(0.4, 0, 0);

    // 3. Subtle Lighting matching daylight and water caustics
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.4);
    sunLight.position.set(6, 8, 5);
    scene.add(sunLight);

    const waterGlintLight = new THREE.DirectionalLight(0x38bdf8, 1.1);
    waterGlintLight.position.set(-5, 4, 3);
    scene.add(waterGlintLight);

    // 4. Natural Meandering River Curve (Following the actual waterway: Treatment weir -> Central Quality Island -> Cooling Intake)
    // No straight pipe or thick tube!
    const riverPoints = [
      new THREE.Vector3(-6.5, 0.4, -2.5),  // Treatment plant cascade outflow
      new THREE.Vector3(-4.5, -0.2, -1.8), // Weir drop into river basin
      new THREE.Vector3(-2.2, -0.6, -0.8), // River bend before monitoring island
      new THREE.Vector3(-0.4, -0.7, 0.2),  // Waterway passing telemetry station
      new THREE.Vector3(1.6, -0.8, 0.8),   // Downstream curve
      new THREE.Vector3(3.8, -0.9, 1.2),   // Approach to industrial cooling intake
      new THREE.Vector3(6.2, -0.8, 0.5),   // Cooling intake manifold & reuse suction
    ];

    const riverCurve = new THREE.CatmullRomCurve3(riverPoints, false, 'catmullrom', 0.5);

    // 5. Water Flow Current Particles (Natural glints and eddies flowing smoothly along the river)
    const particleCount = 220;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particleProgress = new Float32Array(particleCount);
    const particleSpeeds = new Float32Array(particleCount);
    const particleOffsets = new Float32Array(particleCount * 3);

    const colEffluent = new THREE.Color(0x38bdf8); // Light cyan at outflow
    const colFiltered = new THREE.Color(0x22d3ee); // Pure cyan at screening
    const colIntake = new THREE.Color(0x0284c7);   // Rich azure at intake

    for (let i = 0; i < particleCount; i++) {
      particleProgress[i] = Math.random();
      particleSpeeds[i] = (0.0008 + Math.random() * 0.0014) * (prefersReducedMotion ? 0.3 : 1.0);

      // Lateral and vertical variance to simulate width of river
      particleOffsets[i * 3] = (Math.random() - 0.5) * 0.75;
      particleOffsets[i * 3 + 1] = (Math.random() - 0.5) * 0.18;
      particleOffsets[i * 3 + 2] = (Math.random() - 0.5) * 0.65;

      const pt = riverCurve.getPoint(particleProgress[i]);
      particlePositions[i * 3] = pt.x + particleOffsets[i * 3];
      particlePositions[i * 3 + 1] = pt.y + particleOffsets[i * 3 + 1];
      particlePositions[i * 3 + 2] = pt.z + particleOffsets[i * 3 + 2];

      // Subtle natural glint color interpolation
      const p = particleProgress[i];
      const c = p < 0.5 ? colEffluent.clone().lerp(colFiltered, p * 2) : colFiltered.clone().lerp(colIntake, (p - 0.5) * 2);
      particleColors[i * 3] = c.r;
      particleColors[i * 3 + 1] = c.g;
      particleColors[i * 3 + 2] = c.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const riverParticles = new THREE.Points(particleGeo, particleMaterial);
    scene.add(riverParticles);

    // 6. Central Quality Monitoring Station Beacons (Matching the green and blue lights in the reference image)
    const telemetryGroup = new THREE.Group();
    telemetryGroup.position.set(-0.35, -0.15, 0.2);

    // Green Sensor Beacon (Inline sensor online)
    const greenBeaconGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const greenBeaconMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.95,
    });
    const greenBeacon = new THREE.Mesh(greenBeaconGeo, greenBeaconMat);
    greenBeacon.position.set(-0.2, 0.45, 0);
    telemetryGroup.add(greenBeacon);

    // Blue Sensor Beacon (Telemetry link active)
    const blueBeaconGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const blueBeaconMat = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.95,
    });
    const blueBeacon = new THREE.Mesh(blueBeaconGeo, blueBeaconMat);
    blueBeacon.position.set(0.2, 0.45, 0);
    telemetryGroup.add(blueBeacon);

    // Soft Sensor Halo Ring on the Water Surface (Representing real-time acoustic/optical water testing)
    const ringGeo = new THREE.RingGeometry(0.18, 0.24, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const rippleRing1 = new THREE.Mesh(ringGeo, ringMat);
    rippleRing1.position.set(0, -0.4, 0);
    telemetryGroup.add(rippleRing1);

    const rippleRing2 = rippleRing1.clone();
    (rippleRing2.material as THREE.Material) = ringMat.clone();
    rippleRing2.scale.set(1.6, 1.6, 1.6);
    telemetryGroup.add(rippleRing2);

    scene.add(telemetryGroup);

    // 7. Subtle Cooling Tower Plume Particles (Right side: soft condensation drifting upwards)
    const plumeCount = 45;
    const plumeGeo = new THREE.BufferGeometry();
    const plumePositions = new Float32Array(plumeCount * 3);
    const plumeAlphas = new Float32Array(plumeCount);
    const plumeYBase = 2.4;

    for (let i = 0; i < plumeCount; i++) {
      plumePositions[i * 3] = 4.8 + (Math.random() - 0.5) * 0.8;     // Cooling tower top X
      plumePositions[i * 3 + 1] = plumeYBase + Math.random() * 1.6;  // Rise height Y
      plumePositions[i * 3 + 2] = -2.2 + (Math.random() - 0.5) * 0.5; // Z depth
      plumeAlphas[i] = Math.random();
    }

    plumeGeo.setAttribute('position', new THREE.BufferAttribute(plumePositions, 3));

    const plumeMat = new THREE.PointsMaterial({
      color: 0xf8fafc,
      size: 0.28,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
    });

    const plumeParticles = new THREE.Points(plumeGeo, plumeMat);
    scene.add(plumeParticles);

    // 8. Gentle Shimmer Wave Plane (Soft sunlight glint over the lower river water area)
    const waveGeo = new THREE.PlaneGeometry(16, 6, 24, 12);
    waveGeo.rotateX(-Math.PI / 2.3);
    const waveMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.4,
      metalness: 0.15,
      transparent: true,
      opacity: 0.08,
      wireframe: false,
    });
    const waveMesh = new THREE.Mesh(waveGeo, waveMat);
    waveMesh.position.set(0.5, -1.0, 0);
    scene.add(waveMesh);

    // 9. Mouse Parallax & Resize Handling
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth || 1200;
      const h = container.clientHeight || 700;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 10. Animation Loop
    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse parallax easing
      if (!prefersReducedMotion) {
        targetX += (mouseX * 0.35 - targetX) * 0.04;
        targetY += (mouseY * 0.2 - targetY) * 0.04;
        camera.position.x = targetX;
        camera.position.y = 1.8 + targetY;
        camera.lookAt(0.4 + targetX * 0.5, targetY * 0.3, 0);
      }

      // Animate river current particles along the curve
      const posArray = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        particleProgress[i] = (particleProgress[i] + particleSpeeds[i]) % 1.0;
        const pt = riverCurve.getPoint(particleProgress[i]);

        // Lateral meander sine wave
        const meanderSin = Math.sin(elapsedTime * 1.5 + particleProgress[i] * 8.0) * 0.08;

        posArray[i * 3] = pt.x + particleOffsets[i * 3] + meanderSin;
        posArray[i * 3 + 1] = pt.y + particleOffsets[i * 3 + 1];
        posArray[i * 3 + 2] = pt.z + particleOffsets[i * 3 + 2];
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Animate Telemetry Beacons (Subtle breathing pulse)
      const pulse = Math.sin(elapsedTime * 2.8) * 0.15 + 0.85;
      greenBeaconMat.opacity = pulse;
      blueBeaconMat.opacity = Math.cos(elapsedTime * 2.8) * 0.15 + 0.85;

      // Expanding sensor ripple rings
      const ringScale1 = (1.0 + (elapsedTime * 0.4) % 1.0) * 1.4;
      rippleRing1.scale.set(ringScale1, ringScale1, ringScale1);
      (rippleRing1.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.35 * (1.0 - (ringScale1 - 1.4) / 1.4));

      // Animate cooling tower condensation rising
      const plumePos = plumeGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < plumeCount; i++) {
        plumePos[i * 3 + 1] += (0.003 + Math.random() * 0.002) * (prefersReducedMotion ? 0.3 : 1.0);
        if (plumePos[i * 3 + 1] > plumeYBase + 2.0) {
          plumePos[i * 3 + 1] = plumeYBase;
          plumePos[i * 3] = 4.8 + (Math.random() - 0.5) * 0.8;
        }
      }
      plumeGeo.attributes.position.needsUpdate = true;

      // Subtle wave surface undulation
      if (!prefersReducedMotion) {
        waveMesh.position.y = -1.0 + Math.sin(elapsedTime * 0.8) * 0.03;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 11. Complete GPU and Event Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);

      // Dispose geometries
      particleGeo.dispose();
      greenBeaconGeo.dispose();
      blueBeaconGeo.dispose();
      ringGeo.dispose();
      plumeGeo.dispose();
      waveGeo.dispose();

      // Dispose materials
      particleMaterial.dispose();
      greenBeaconMat.dispose();
      blueBeaconMat.dispose();
      ringMat.dispose();
      plumeMat.dispose();
      waveMat.dispose();

      // Clear scene and renderer
      while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
      }

      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (!webGLSupported) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
};
