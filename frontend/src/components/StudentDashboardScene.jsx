import { Canvas } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial, Points, PointMaterial } from "@react-three/drei";
import { useMemo } from "react";

function GlassOrb({ position, scale = 1, speed = 1 }) {
  return (
    <Float
      speed={speed}
      rotationIntensity={0.35}
      floatIntensity={1.2}
    >
      <mesh position={position} scale={scale}>
        <sphereGeometry args={[1, 48, 48]} />

        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={0.35}
          chromaticAberration={0.04}
          anisotropy={0.15}
          distortion={0.08}
          distortionScale={0.2}
          temporalDistortion={0.05}
          roughness={0.08}
          transmission={1}
          ior={1.35}
          transparent
          opacity={0.32}
        />
      </mesh>
    </Float>
  );
}

function FloatingParticles() {
  const particles = useMemo(() => {
    const positions = [];

    for (let i = 0; i < 180; i++) {
      positions.push(
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 8
      );
    }

    return new Float32Array(positions);
  }, []);

  return (
    <Points positions={particles} stride={3}>
      <PointMaterial
        transparent
        color="#8b5cf6"
        size={0.035}
        sizeAttenuation
        depthWrite={false}
        opacity={0.45}
      />
    </Points>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={1.2} />

      <directionalLight
        position={[5, 5, 5]}
        intensity={2}
      />

      <pointLight
        position={[-5, 2, 4]}
        intensity={15}
        distance={12}
      />

      <pointLight
        position={[6, -2, -2]}
        intensity={12}
        distance={10}
      />

      <FloatingParticles />

      <GlassOrb
        position={[-6, 2.8, -2]}
        scale={1.7}
        speed={0.45}
      />

      <GlassOrb
        position={[6, 2.2, -3]}
        scale={1.25}
        speed={0.6}
      />

      <GlassOrb
        position={[5.5, -3, -2]}
        scale={1.8}
        speed={0.5}
      />

      <GlassOrb
        position={[-6, -3, -1]}
        scale={1.15}
        speed={0.7}
      />

      <GlassOrb
        position={[0, 4, -4]}
        scale={0.7}
        speed={0.8}
      />
    </>
  );
}

function StudentDashboardScene() {
  return (
    <div className="student-3d-background">
      <Canvas
        camera={{
          position: [0, 0, 10],
          fov: 50,
        }}
        dpr={[1, 1.5]}
      >
        <Scene />
      </Canvas>
    </div>
  );
}

export default StudentDashboardScene;