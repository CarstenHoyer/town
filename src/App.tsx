import { Canvas } from "@react-three/fiber";
import { Scene } from "./Scene";
import { Mesh } from "three";
import { Leva } from "leva";
import { getProject } from "@theatre/core";
import { SheetProvider } from "@theatre/r3f";
import studio from "@theatre/studio";
import extension from "@theatre/r3f/dist/extension";
import { editable as e, PerspectiveCamera } from "@theatre/r3f";
import { useEffect, useRef, useState } from "react";
import { UI } from "./UI";

import projectState from "./assets/MedievalTown.theatre-project-state.json";

export const isProd = import.meta.env.MODE === "production";

if (!isProd) {
  studio.initialize();
  studio.extend(extension);
}

const project = getProject(
  "MedievalTown",
  isProd ? { state: projectState } : undefined
);
const mainSheet = project.sheet("Main");

function App() {
  const [currentScreen, setCurrentScreen] = useState<string>("Intro");
  const [targetScreen, setTargetScreen] = useState<string>("Home");

  const cameraTarget = useRef<Mesh>(null);
  const isSetup = useRef(false);

  const transitions: {
    [key: string]: [number, number];
    // Home: [number, number];
    // Castle: [number, number];
    // Windmill: [number, number];
  } = {
    Home: [0, 5],
    Castle: [6, 12 + 16 / 30],
    Windmill: [14, 18],
  };

  useEffect(() => {
    console.log("currentScreen", currentScreen);
    console.log("targetScreen", targetScreen);

    if (isSetup.current && currentScreen === "Intro") {
      return;
    }
    console.log("setup");
    isSetup.current = true;
    const reverse = targetScreen === "Home" && currentScreen !== "Intro";
    console.log({ reverse });

    project.ready.then(() => {
      console.log("HER");
      if (currentScreen === targetScreen) {
        console.log("NOPE");
        return;
      }
      const transition = transitions[reverse ? currentScreen : targetScreen];
      console.log({ transition });
      if (!transition) {
        return;
      }
      mainSheet.sequence
        .play({
          range: transition,
          direction: reverse ? "reverse" : "normal",
          rate: reverse ? 2 : 1,
        })
        .then(() => {
          setCurrentScreen(targetScreen);
        });
    });
  }, [targetScreen, transitions, mainSheet]);

  return (
    <>
      <Leva hidden={true} />
      <UI
        currentScreen={currentScreen}
        onScreenChange={setTargetScreen}
        isAnimating={currentScreen !== targetScreen}
      />
      <Canvas shadows gl={{ preserveDrawingBuffer: true }}>
        <SheetProvider sheet={mainSheet}>
          <PerspectiveCamera
            position={[20, 20, 40]}
            fov={30}
            near={1}
            makeDefault
            lookAt={cameraTarget}
            theatreKey="Camera"
          />
          <e.mesh
            theatreKey="Camera Target"
            visible="editor"
            ref={cameraTarget}
          >
            <octahedronGeometry args={[0.1, 0]} />
            <meshPhongMaterial color="yellow" />
          </e.mesh>
          <Scene />
        </SheetProvider>
      </Canvas>
    </>
  );
}

export default App;
