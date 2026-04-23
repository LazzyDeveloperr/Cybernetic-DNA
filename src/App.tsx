/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerformanceMonitor } from '@react-three/drei';
import { Suspense, useState } from 'react';
import { DNA } from './components/DNA';
import { FloatingParticles } from './components/Particles';
import { Effects } from './components/Effects';

export default function App() {
  // Dynamically scale resolution based on the user's GPU performance
  // 1 is standard, 2 is high-res. This allows 120FPS on strong GPUs and prevents lag on weak ones.
  const [dpr, setDpr] = useState(1.5);

  return (
    <div className="w-full h-screen bg-[#040914] overflow-hidden select-none">
      <Canvas
        camera={{ position: [0, 0, 85], fov: 32 }}
        // Alpha and stencil disabled to save severe GPU bandwidth
        // Antialias disabled natively because EffectComposer handles multisampling
        gl={{ antialias: false, powerPreference: "high-performance", alpha: false, stencil: false }}
        dpr={dpr}
      >
        <PerformanceMonitor onIncline={() => setDpr(2)} onDecline={() => setDpr(1)} bounds={() => [50, 110]}>
          <color attach="background" args={['#040914']} />
          <fog attach="fog" args={['#040914', 30, 110]} />
          
          {/* Soft immersive ambient glow */}
          <ambientLight intensity={0.2} />
          
          {/* Cinematic Rim Lights wrapping the metallic structures */}
          <directionalLight position={[10, 20, 10]} intensity={1.5} color="#ffffff" />
          <pointLight position={[-15, -10, 5]} intensity={180} color="#0088ff" distance={60} />
          <pointLight position={[15, 0, -15]} intensity={120} color="#00ffcc" distance={50} />

          <Suspense fallback={null}>
              <Environment preset="city" />
              <DNA />
              {/* Keeping the particles to add depth to the dark blue void */}
              <FloatingParticles />
              <Effects />
          </Suspense>

          <OrbitControls 
              autoRotate
              autoRotateSpeed={0.5}
              enablePan={false}
              enableZoom={true}
              enableRotate={true}
              minDistance={15}
              maxDistance={120}
          />
        </PerformanceMonitor>
      </Canvas>
    </div>
  );
}
