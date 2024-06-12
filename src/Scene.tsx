import {
  Center,
  Environment,
  OrbitControls,
  SoftShadows,
} from "@react-three/drei";
import { Model } from "./Book";
import { useFrame, useThree } from "@react-three/fiber";
import { button, useControls } from "leva";
import { editable as e } from "@theatre/r3f";
import { Autofocus, EffectComposer } from "@react-three/postprocessing";
import { useRef } from "react";
import { Mesh, Vector3 } from "three";
import { isProd } from "./App";

export const Scene = () => {
  const focusTargetRef = useRef<Vector3>(new Vector3(0, 0, 0));
  const focusTargetVisualizerRef = useRef<Mesh>(null);
  const { camera } = useThree();
  const { intensity1 } = useControls({
    intensity1: { value: 1.2, min: 0, max: 10, step: 0.1 },
    getCamera: button(() => {
      console.log(camera.position, camera.rotation);
    }),
  });

  const shadowMapSize = 2048;

  useFrame(() => {
    if (focusTargetVisualizerRef.current) {
      focusTargetRef.current.copy(focusTargetVisualizerRef.current.position);
    }
  });

  return (
    <>
      <OrbitControls />

      <e.directionalLight
        theatreKey="SunLight"
        position={[3, -3, 3]}
        intensity={intensity1 * Math.PI}
        castShadow
        shadow-bias={-0.001}
        shadow-mapSize-width={shadowMapSize}
        shadow-mapSize-height={shadowMapSize}
      />

      <Environment preset="dawn" background blur={40} />
      <SoftShadows />

      <e.mesh theatreKey="Autofocus" ref={focusTargetVisualizerRef}>
        <sphereGeometry args={[0.01, 8, 8]} />
        <meshPhongMaterial color="red" />
      </e.mesh>

      <EffectComposer>
        <Autofocus
          smoothTime={0.1}
          debug={isProd ? undefined : 0.04}
          focusRange={0.002}
          bokehScale={8}
          target={focusTargetRef.current}
        />
      </EffectComposer>

      <Center top>
        <e.group theatreKey="Book">
          <Model scale={0.1} />
        </e.group>
      </Center>
    </>
  );
};
