"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useReducedMotion } from "@/components/brand/motion-provider";

/**
 * Apex Matrix Core — clean exploded paddle cross-section.
 * Carbon face sheets + honeycomb core + neon energy ring + grip.
 */
export function LandingPaddle3D({ className = "" }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || reduced) return;

    const w = mount.clientWidth || 360;
    const h = mount.clientHeight || 400;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, w / h, 0.1, 100);
    camera.position.set(0, 0.05, 4.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mount.appendChild(renderer.domElement);

    const root = new THREE.Group();
    scene.add(root);

    const carbon = new THREE.MeshStandardMaterial({
      color: 0x1c1e1c,
      metalness: 0.8,
      roughness: 0.28,
    });
    const carbonDeep = new THREE.MeshStandardMaterial({
      color: 0x0c0e0c,
      metalness: 0.7,
      roughness: 0.4,
    });
    const honeycomb = new THREE.MeshStandardMaterial({
      color: 0x3a4236,
      metalness: 0.25,
      roughness: 0.65,
    });
    const neon = new THREE.MeshStandardMaterial({
      color: 0xb8ff2e,
      metalness: 0.15,
      roughness: 0.2,
      emissive: 0xb8ff2e,
      emissiveIntensity: 1.5,
    });
    const neonDim = new THREE.MeshStandardMaterial({
      color: 0xb8ff2e,
      metalness: 0.1,
      roughness: 0.35,
      emissive: 0x5a8018,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.75,
    });

    // Paddle face silhouette via scaled capsule-ish: box + rounded feel with torus rim
    const faceW = 1.35;
    const faceH = 1.75;
    const faceT = 0.055;

    const front = new THREE.Mesh(new THREE.BoxGeometry(faceW, faceH, faceT), carbon);
    front.position.set(0, 0.35, 0);
    root.add(front);

    const back = new THREE.Mesh(new THREE.BoxGeometry(faceW, faceH, faceT), carbonDeep);
    back.position.set(0, 0.35, 0);
    root.add(back);

    // Core slab (matrix)
    const core = new THREE.Mesh(new THREE.BoxGeometry(faceW * 0.9, faceH * 0.88, 0.32), honeycomb);
    core.position.set(0, 0.35, 0);
    root.add(core);

    // Hex-ish lattice lines on core (thin boxes forming a grid)
    const lattice = new THREE.Group();
    const latMat = new THREE.MeshStandardMaterial({
      color: 0xb8ff2e,
      emissive: 0x3d5510,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.4,
    });
    for (let i = -3; i <= 3; i++) {
      const v = new THREE.Mesh(new THREE.BoxGeometry(0.015, faceH * 0.82, 0.3), latMat);
      v.position.set(i * 0.16, 0.35, 0);
      lattice.add(v);
      const hz = new THREE.Mesh(new THREE.BoxGeometry(faceW * 0.82, 0.015, 0.3), latMat);
      hz.position.set(0, 0.35 + i * 0.18, 0);
      lattice.add(hz);
    }
    root.add(lattice);

    // Central energy pillar
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.55, 28), neon);
    pillar.position.set(0, 0.35, 0);
    root.add(pillar);

    // Signature neon ring
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.04, 20, 100), neon);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, 0.35, 0);
    root.add(ring);

    const ringHalo = new THREE.Mesh(new THREE.TorusGeometry(0.88, 0.012, 12, 80), neonDim);
    ringHalo.rotation.x = Math.PI / 2;
    ringHalo.position.set(0, 0.35, 0);
    root.add(ringHalo);

    // Edge rim on faces
    const rimFront = new THREE.Mesh(
      new THREE.TorusGeometry(0.78, 0.022, 10, 64),
      carbon
    );
    rimFront.scale.set(0.78, 1.02, 1);
    rimFront.rotation.x = Math.PI / 2;
    rimFront.position.set(0, 0.35, 0);
    root.add(rimFront);

    // Handle
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.95, 18), carbonDeep);
    handle.position.set(0, -0.95, 0);
    root.add(handle);

    const butt = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.07, 18), neonDim);
    butt.position.set(0, -1.45, 0);
    root.add(butt);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(2.8, 3.5, 4);
    scene.add(key);
    const neonKey = new THREE.PointLight(0xb8ff2e, 4.2, 14);
    neonKey.position.set(-1, 0.8, 2.2);
    scene.add(neonKey);
    const backLight = new THREE.PointLight(0xb8ff2e, 2.0, 10);
    backLight.position.set(1.2, 0, -2.5);
    scene.add(backLight);

    root.rotation.set(-0.28, 0.55, 0.08);

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    const onMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      target.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      target.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    let t = 0;
    let raf = 0;
    const tick = () => {
      t += 0.01;
      current.x += (target.x - current.x) * 0.08;
      current.y += (target.y - current.y) * 0.08;

      // Explode faces gently
      const sep = 0.18 + (Math.sin(t * 0.7) * 0.5 + 0.5) * 0.32;
      front.position.z = sep;
      back.position.z = -sep;
      rimFront.position.z = sep;
      lattice.position.z = 0;

      // Ring spin + pulse
      ring.rotation.z = t * 0.4;
      ringHalo.rotation.z = -t * 0.25;
      const pulse = 1 + Math.sin(t * 2.4) * 0.045;
      ring.scale.setScalar(pulse);
      neon.emissiveIntensity = 1.25 + Math.sin(t * 2.8) * 0.4;

      root.rotation.y = 0.55 + current.x * 0.5;
      root.rotation.x = -0.28 + current.y * -0.28;
      root.position.y = Math.sin(t * 0.85) * 0.05;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    const onResize = () => {
      const nw = mount.clientWidth;
      const nh = mount.clientHeight;
      camera.aspect = nw / Math.max(nh, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      ro.disconnect();
      renderer.dispose();
      [carbon, carbonDeep, honeycomb, neon, neonDim, latMat].forEach((m) => m.dispose());
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [reduced]);

  if (reduced) {
    return <div className={`relative overflow-hidden bg-[#0a0a0a] ${className}`} aria-hidden />;
  }

  return (
    <div ref={mountRef} className={`relative w-full h-full min-h-[280px] ${className}`} aria-hidden />
  );
}
