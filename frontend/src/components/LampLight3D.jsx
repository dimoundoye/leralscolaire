import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const LampLight3D = ({ className = '', interactive = true }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Initialisation de la scène & caméra
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0c1445, 0.006);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(54, width / height, 0.1, 1000);
    camera.position.set(0, -10, 95);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // 2. Particules du faisceau Léral (Lamp Light Simulation)
    const count = 14000;
    const geometry = new THREE.TetrahedronGeometry(0.20);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const instancedMesh = new THREE.InstancedMesh(geometry, material, count);

    const dummy = new THREE.Object3D();
    const target = new THREE.Vector3();
    const pColor = new THREE.Color();
    const positions = [];

    for (let i = 0; i < count; i++) {
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100
      );
      positions.push(pos);
      dummy.position.copy(pos);
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(i, dummy.matrix);
      instancedMesh.setColorAt(i, pColor.setHex(0xffffff));
    }
    instancedMesh.instanceMatrix.needsUpdate = true;
    if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;

    scene.add(instancedMesh);

    // Paramètres de la lampe Léral
    const PARAMS = {
      spread: 0.48,   // Cône régulier
      reach: 78,      // Portée équilibrée
      haze: 1.1,
      flicker: 0.25,
      warmth: 0.095,  // Teinte dorée / ambrée Léral
      drift: 0.55
    };

    // Interaction souris douce
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handleMouseMove = (e) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetRotationY = x * 0.4;
      targetRotationX = y * 0.25;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 3. Boucle d'animation à 60 FPS
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const time = clock.getElapsedTime();
      const { spread, reach, haze, flicker, warmth, drift } = PARAMS;
      const apexY = 16; // Le lustre (sommet entier) se place 100% en dessous de la navbar
      const floorY = -48; // Le faisceau s'étend jusqu'en bas



      const gold = 2.399963;
      const flick = 1.0 + flicker * 0.18 * (
        Math.sin(time * 13.7) + 
        0.6 * Math.sin(time * 29.1 + 1.3) + 
        0.4 * Math.sin(time * 7.3 + 2.1)
      );

      const nBulb = count * 0.05;
      const nShade = count * 0.13;
      const nBeam = count * 0.74;
      const nPool = count * 0.88;

      for (let i = 0; i < count; i++) {
        const s1 = Math.sin(i * 12.9898 + 1.0) * 43758.5453;
        const r1 = s1 - Math.floor(s1);
        const s2 = Math.sin(i * 78.233 + 2.0) * 24634.6345;
        const r2 = s2 - Math.floor(s2);
        const s3 = Math.sin(i * 39.425 + 3.0) * 15731.743;
        const r3 = s3 - Math.floor(s3);

        if (i < nBulb) {
          // Filament (Blanc Pur)
          const f = (i + 0.5) / Math.max(1, nBulb);
          const yy = 1 - 2 * f;
          const rr = Math.sqrt(Math.max(0.0001, 1 - yy * yy));
          const a = gold * i + time * 0.15;
          const rad = reach * 0.035 * (1 + 0.06 * Math.sin(time * 1.5 + i));
          target.set(Math.cos(a) * rr * rad, apexY - reach * 0.06 + yy * rad, Math.sin(a) * rr * rad);
          pColor.setHSL(0, 0, Math.max(0, Math.min(1, 0.98 * flick)));
        } else if (i < nShade) {
          // Abat-jour (Blanc Lumineux)
          const f = (i - nBulb) / Math.max(1, nShade - nBulb);
          const a = gold * i;
          const rad = reach * (0.03 + 0.14 * f);
          const y = apexY + reach * 0.10 - f * reach * 0.14;
          const rim = f * f * f;
          target.set(Math.cos(a) * rad, y, Math.sin(a) * rad);
          pColor.setHSL(0, 0, Math.max(0, Math.min(1, (0.08 + 0.65 * rim) * flick)));
        } else if (i < nBeam) {
          // Faisceau lumineux volumétrique (Lumière Blanche Léral)
          const f = (i - nShade) / Math.max(1, nBeam - nShade);
          let t = f + time * 0.022 * (0.5 + r3);
          t = t - Math.floor(t);
          const depth = Math.pow(t, 0.85);
          const coneR = Math.max(0.001, depth * reach * spread);
          const u = Math.pow(r1, 0.6);
          const a = gold * i + time * (0.09 - 0.04 * depth) + r2 * 6.2831;
          const x = Math.cos(a) * u * coneR + Math.sin(time * 0.4 + depth * 6.0 + r2 * 6.2831) * haze * 0.6;
          const z = Math.sin(a) * u * coneR + Math.cos(time * 0.35 + depth * 5.0 + r1 * 6.2831) * haze * 0.6;
          const axial = 1 - depth;
          const radial = 1 - u * u;
          const b = Math.pow(Math.max(0, axial), 1.4) * (0.25 + 0.75 * radial);
          target.set(x, apexY - depth * reach, z);
          pColor.setHSL(0, 0, Math.max(0, Math.min(1, (0.10 + 0.82 * b) * flick)));
        } else if (i < nPool) {
          // Halo au sol (Blanc)
          const f = (i - nBeam) / Math.max(1, nPool - nBeam);
          const u = Math.sqrt(f);
          const a = gold * i;
          const rad = u * reach * spread * 1.02;
          const b = Math.pow(Math.max(0, 1 - u), 1.8);
          target.set(Math.cos(a) * rad, floorY + 0.4 * Math.sin(time * 0.6 + rad * 0.2), Math.sin(a) * rad);
          pColor.setHSL(0, 0, Math.max(0, Math.min(1, (0.05 + 0.75 * b) * flick)));
        } else {
          // Poussières en suspension / Motes (Blanc Diamant)
          const span = reach * 1.25;
          let by = r3 + time * 0.01 * drift;
          by = by - Math.floor(by);
          const y = apexY - by * reach;
          const x = (r1 - 0.5) * 2 * span + Math.sin(time * 0.25 + r1 * 6.2831) * drift * 2.0;
          const z = (r2 - 0.5) * 2 * span + Math.cos(time * 0.22 + r2 * 6.2831) * drift * 2.0;
          const depth = Math.max(0.001, by);
          const coneR = Math.max(0.001, depth * reach * spread);
          const d = Math.sqrt(x * x + z * z) / coneR;
          const lit = Math.max(0, 1 - d * d);
          target.set(x, y, z);
          pColor.setHSL(0, 0, Math.max(0, Math.min(1, (0.03 + 0.92 * lit * (1 - depth * 0.7)) * flick)));
        }

        positions[i].lerp(target, 0.1);
        dummy.position.copy(positions[i]);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);
        instancedMesh.setColorAt(i, pColor);
      }

      instancedMesh.instanceMatrix.needsUpdate = true;
      if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;

      // Rotation automatique très douce et apaisante
      scene.rotation.y = time * 0.025 + (targetRotationY - scene.rotation.y) * 0.04;
      scene.rotation.x = (targetRotationX - scene.rotation.x) * 0.04;

      renderer.render(scene, camera);
    };

    animate();

    // 4. Redimensionnement réactif
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // 5. Nettoyage lors du démontage
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [interactive]);

  return (
    <div 
      ref={containerRef} 
      className={`lamp-3d-container ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 1
      }}
    />
  );
};

export default LampLight3D;
