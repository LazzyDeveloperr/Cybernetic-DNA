import { EffectComposer, DepthOfField, Bloom, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

export function Effects() {
    return (
        <EffectComposer disableNormalPass multisampling={4}>
            {/* Resolution scale set to 0.5 (half-resolution DoF) drastically improves performance 
                on large monitors while maintaining the cinematic blur effect */}
            <DepthOfField 
                target={[0, 0, 0]}
                focalLength={0.03} 
                bokehScale={8} 
                resolutionScale={0.5}
            />
            <Bloom 
                luminanceThreshold={0.1} 
                luminanceSmoothing={0.9} 
                intensity={2.5} 
                mipmapBlur={true} 
            />
            <ChromaticAberration 
                blendFunction={BlendFunction.NORMAL} 
                offset={new THREE.Vector2(0.004, 0.004)} 
            />
            <Noise 
                opacity={0.02} 
                blendFunction={BlendFunction.OVERLAY} 
            />
            <Vignette 
                eskil={false} 
                offset={0.1} 
                darkness={1.1} 
            />
        </EffectComposer>
    );
}
