import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';

const NUM_PAIRS = 50; 
const RADIUS = 8;
const HEIGHT_STEP = 2.0; 
const ANGLE_STEP = (Math.PI * 2) / 12; // 12 base pairs per full 360 degree rotation

const COLOR_GLOW = new THREE.Color('#ff8800'); // Orange glow
const COLOR_CYAN = new THREE.Color('#00dbff'); // Cyan tech

const upVector = new THREE.Vector3(0, 1, 0);

export function DNA() {
  const groupRef = useRef<THREE.Group>(null);
  
  const { curve1, curve2, ringJoints, rBases, rPins, rTips, techLines, centerDots } = useMemo(() => {
    const pts1 = [];
    const pts2 = [];
    
    // offset creates the biological Major and Minor grooves
    const offset = Math.PI * 0.85; 

    // Generate perfectly smooth continuous curve paths for the backbones
    for (let i = 0; i <= NUM_PAIRS; i++) {
        const t = i * ANGLE_STEP;
        const y = i * HEIGHT_STEP - (NUM_PAIRS * HEIGHT_STEP) / 2;
        pts1.push(new THREE.Vector3(RADIUS * Math.cos(t), y, RADIUS * Math.sin(t)));
        pts2.push(new THREE.Vector3(RADIUS * Math.cos(t + offset), y, RADIUS * Math.sin(t + offset)));
    }
    
    const c1 = new THREE.CatmullRomCurve3(pts1);
    const c2 = new THREE.CatmullRomCurve3(pts2);

    const rJ = [];
    const rB = [];
    const rP = [];
    const rT = [];
    const tL = [];
    const cD = [];
    
    // Extrapolate perfectly aligned cybernetic mechanical parts along the curves
    for (let i = 0; i <= NUM_PAIRS; i++) {
        const f = i / NUM_PAIRS;
        
        // Find exact positions and true tangents matching the continuous spine
        const p1 = c1.getPointAt(f);
        const p2 = c2.getPointAt(f);
        const tan1 = c1.getTangentAt(f);
        const tan2 = c2.getTangentAt(f);
        
        // --- Rings wrapping perfectly around the Backbone ---
        const quat1 = new THREE.Quaternion().setFromUnitVectors(upVector, tan1);
        const quat2 = new THREE.Quaternion().setFromUnitVectors(upVector, tan2);
        
        rJ.push({ position: p1, rotation: quat1 });
        rJ.push({ position: p2, rotation: quat2 });

        // --- Hovering Tech Lines (placed precisely midway between junctions) ---
        if (i < NUM_PAIRS && Math.random() > 0.25) {
            const fMid = (i + 0.5) / NUM_PAIRS;
            const p1Mid = c1.getPointAt(fMid);
            const tan1Mid = c1.getTangentAt(fMid);
            const q1Mid = new THREE.Quaternion().setFromUnitVectors(upVector, tan1Mid)
                .multiply(new THREE.Quaternion().setFromAxisAngle(upVector, Math.random() * Math.PI));
            tL.push({ position: p1Mid, rotation: q1Mid, scale: [1, 2.0, 1] });
        }
        if (i < NUM_PAIRS && Math.random() > 0.25) {
            const fMid = (i + 0.5) / NUM_PAIRS;
            const p2Mid = c2.getPointAt(fMid);
            const tan2Mid = c2.getTangentAt(fMid);
            const q2Mid = new THREE.Quaternion().setFromUnitVectors(upVector, tan2Mid)
                .multiply(new THREE.Quaternion().setFromAxisAngle(upVector, Math.random() * Math.PI));
            tL.push({ position: p2Mid, rotation: q2Mid, scale: [1, 2.0, 1] });
        }

        // --- Inward T-Junction Rungs ---
        const center = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
        
        const rungDir1 = new THREE.Vector3().subVectors(center, p1);
        const rungDist = rungDir1.length();
        rungDir1.normalize();
        
        const rungDir2 = new THREE.Vector3().subVectors(center, p2);
        rungDir2.normalize();
        
        const buildRungHalf = (startPos: THREE.Vector3, dir: THREE.Vector3) => {
            const rot = new THREE.Quaternion().setFromUnitVectors(upVector, dir);
            
            // Thick base pipe emerging seamlessly from the backbone
            const baseLen = rungDist * 0.4;
            const basePos = startPos.clone().add(dir.clone().multiplyScalar(baseLen / 2));
            rB.push({ position: basePos, rotation: rot, scale: [1, baseLen, 1] });
            
            // Inner thinner pin/piston extending inwards
            const pinLen = rungDist * 0.35;
            const pinPos = startPos.clone().add(dir.clone().multiplyScalar(baseLen + pinLen / 2));
            rP.push({ position: pinPos, rotation: rot, scale: [1, pinLen, 1] });
            
            // Glowing neon ring at the central gap
            const tipPos = startPos.clone().add(dir.clone().multiplyScalar(baseLen + pinLen));
            rT.push({ position: tipPos, rotation: rot, scale: [1, 1, 1] });
            
            return tipPos;
        }
        
        const tip1 = buildRungHalf(p1, rungDir1);
        const tip2 = buildRungHalf(p2, rungDir2);
        
        // --- Bridging Dotted Structure ---
        const numDots = 8;
        for (let j = 1; j < numDots; j++) {
            const f = j / numDots;
            const dotPos = new THREE.Vector3().lerpVectors(tip1, tip2, f);
            
            // Slightly smaller dots near the rings, larger in the perfect center
            const distFromCenter = Math.abs(f - 0.5) * 2; 
            const dotSize = 0.15 * (1 - distFromCenter * 0.4); 
            
            // Color lerping: Orange near the mechanical tips, Cyan energy in the middle
            const dotColor = new THREE.Color().lerpColors(COLOR_CYAN, COLOR_GLOW, Math.pow(distFromCenter, 1.5));
            dotColor.multiplyScalar(3.5); 
            
            cD.push({ position: dotPos, scale: dotSize, color: dotColor });
        }
    }
    
    return { curve1: c1, curve2: c2, ringJoints: rJ, rBases: rB, rPins: rP, rTips: rT, techLines: tL, centerDots: cD };
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 2.0;
        groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  const emissiveGlow = COLOR_GLOW.clone().multiplyScalar(3.5);
  const emissiveCyan = COLOR_CYAN.clone().multiplyScalar(2.0);

  // Offset Torus rotation so the rim faces the gap properly 
  const torusQuatOffset = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0), Math.PI/2);
  
  // Sleek glossy finish metrics
  const backboneMaterialProps = {
    color: "#1a1f2e", 
    metalness: 0.9,
    roughness: 0.15,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    iridescence: 0.3 // Very subtle sci-fi gleam
  };

  return (
    <group ref={groupRef} rotation={[0, 0, Math.PI / 6]}>
      {/* 1. Perfectly Curvy, Continuous Spine Backbones */}
      <mesh castShadow receiveShadow>
        <tubeGeometry args={[curve1, NUM_PAIRS * 5, 0.6, 24, false]} />
        <meshPhysicalMaterial {...backboneMaterialProps} />
      </mesh>
      
      <mesh castShadow receiveShadow>
        <tubeGeometry args={[curve2, NUM_PAIRS * 5, 0.6, 24, false]} />
        <meshPhysicalMaterial {...backboneMaterialProps} />
      </mesh>

      {/* 2. Tech Lines (Glowing Cyan decals shrink-wrapped on the curves) */}
      <Instances range={techLines.length}>
        {/* Open cylinder to create a wrapped holographic pattern, slightly lower segment count */}
        <cylinderGeometry args={[0.61, 0.61, 1, 10, 1, true, 0, Math.PI / 1.8]} />
        {/* Removed double side to prevent pipeline state change costs */}
        <meshBasicMaterial color={emissiveCyan} toneMapped={false} />
        {techLines.map((d, i) => (
          <Instance key={`tech-${i}`} position={d.position} quaternion={d.rotation} scale={d.scale as [number,number,number]} />
        ))}
      </Instances>

      {/* 3. Cybernetic Backbone Joints (Orange glowing collars perfectly seated on the curve) */}
      <Instances range={ringJoints.length}>
        <torusGeometry args={[0.65, 0.08, 10, 24]} />
        <meshBasicMaterial color={emissiveGlow} toneMapped={false} />
        {ringJoints.map((d, i) => {
          const finalRot = d.rotation.clone().multiply(torusQuatOffset);
          return <Instance key={`joint-${i}`} position={d.position} quaternion={finalRot} />
        })}
      </Instances>

      {/* 4. Rung Bases (Thick T-Junctions securely merged to backbone) */}
      <Instances range={rBases.length} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.3, 1, 16]} />
        <meshPhysicalMaterial {...backboneMaterialProps} />
        {rBases.map((d, i) => (
          <Instance key={`rbase-${i}`} position={d.position} quaternion={d.rotation} scale={d.scale as [number,number,number]} />
        ))}
      </Instances>

      {/* 5. Rung Pins (Inner thinner metallic pistons/rods) */}
      <Instances range={rPins.length} castShadow receiveShadow>
        <cylinderGeometry args={[0.12, 0.12, 1, 12]} />
        <meshStandardMaterial 
            color="#5a6882" // Bright brushed steel
            metalness={0.95} 
            roughness={0.25}
        />
        {rPins.map((d, i) => (
          <Instance key={`rpin-${i}`} position={d.position} quaternion={d.rotation} scale={d.scale as [number,number,number]} />
        ))}
      </Instances>

      {/* 6. Rung Tips (Glowing orange rings floating at the gap intersection) */}
      <Instances range={rTips.length}>
        <torusGeometry args={[0.2, 0.06, 10, 24]} />
        <meshBasicMaterial color={emissiveGlow} toneMapped={false} />
        {rTips.map((d, i) => {
          const finalRot = d.rotation.clone().multiply(torusQuatOffset);
          return <Instance key={`rtip-${i}`} position={d.position} quaternion={finalRot} scale={d.scale as [number,number,number]} />;
        })}
      </Instances>

      {/* 7. Center Dotted Structure (Bridging the gap with glowing energy dots) */}
      <Instances limit={3500} range={centerDots.length}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial toneMapped={false} />
        {centerDots.map((d, i) => (
          <Instance key={`cdot-${i}`} position={d.position} scale={d.scale as number} color={d.color} />
        ))}
      </Instances>

    </group>
  );
}
