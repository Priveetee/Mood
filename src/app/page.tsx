import Silk from "@/components/Silk";

export default function HomePage() {
  return (
    <div className="fixed top-0 left-0 -z-10 h-screen w-screen">
      <Silk
        color="#1a1a2e"
        scale={2.5}
        speed={3}
        noiseIntensity={1.2}
        rotation={0.1}
      />
    </div>
  );
}
