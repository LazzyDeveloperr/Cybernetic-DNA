import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PointMaterial, Points } from '@react-three/drei';
import * as THREE from 'three';

export function FloatingParticles() {
    const numParticles = 4000;
    const distance = 40;
    
    const { positions, colors, speeds } = useMemo(() => {
        const p = new Float32Array(numParticles * 3);
        const c = new Float32Array(numParticles * 3);
        const s = new Float32Array(numParticles);
        
        const colorCyan = new THREE.Color('#00ffff');
        const colorMagenta = new THREE.Color('#ff00aa');
        const colorPurple = new THREE.Color('#9d00ff');

        for (let i = 0; i < numParticles; i++) {
            p[i * 3] = (Math.random() - 0.5) * distance;
            p[i * 3 + 1] = (Math.random() - 0.5) * distance * 1.5;
            p[i * 3 + 2] = (Math.random() - 0.5) * distance;
            
            const r = Math.random();
            const mixedColor = r > 0.66 ? colorCyan : (r > 0.33 ? colorMagenta : colorPurple);
            
            // Random intensity so some glow very bright while others are dim
            const intensity = Math.random() * 2.5 + 0.5;
            
            c[i * 3] = mixedColor.r * intensity;
            c[i * 3 + 1] = mixedColor.g * intensity;
            c[i * 3 + 2] = mixedColor.b * intensity;
            
            s[i] = Math.random() * 0.04 + 0.01; // unique upward speed
        }
        return { positions: p, colors: c, speeds: s };
    }, []);

    const pointsRef = useRef<THREE.Points>(null);

    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
            
            // Add energetic upward flow to the particles
            const positionsArr = pointsRef.current.geometry.attributes.position.array as Float32Array;
            for (let i = 0; i < numParticles; i++) {
                positionsArr[i * 3 + 1] += speeds[i];
                // Loop back to bottom when reaching the top
                if (positionsArr[i * 3 + 1] > distance * 0.75) {
                    positionsArr[i * 3 + 1] = -distance * 0.75;
                }
            }
            pointsRef.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    return (
        <Points ref={pointsRef} positions={positions} colors={colors} stride={3} frustumCulled={false}>
            <PointMaterial
                transparent
                vertexColors
                size={0.12}
                sizeAttenuation={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                toneMapped={false}
            />
        </Points>
    );
}
