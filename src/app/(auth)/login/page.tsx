import Silk from "../../../components/Silk.tsx";
import LoginForm from "../../../components/auth/login-form";

export default function LoginPage() {
  return (
    <>
      <div className="absolute inset-0 z-[-1]">
        <Silk color="#430AC7" noiseIntensity={0.8} scale={1.2} speed={3} />
      </div>
      <LoginForm />
    </>
  );
}
