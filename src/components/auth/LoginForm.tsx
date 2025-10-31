"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  loginSchema,
  registerSchema,
  LoginFormData,
  RegisterFormData,
} from "@/lib/schemas";
import { signIn, signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Lock, Eye, EyeOff, KeyRound } from "lucide-react";

type FormType = "login" | "register";

export default function LoginForm() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FormType>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [canRegister, setCanRegister] = useState(false);

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isSubmitting: isLoginSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors, isSubmitting: isRegisterSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    async function checkCanRegister() {
      try {
        const res = await fetch("/api/auth/can-register");
        const data = await res.json();
        setCanRegister(data.canRegister);
        if (!data.canRegister && activeTab === "register") {
          setActiveTab("login");
        }
      } catch (error) {
        toast.error("Erreur de connexion au serveur d'authentification.");
      }
    }
    checkCanRegister();
  }, [activeTab]);

  const onRegister: SubmitHandler<RegisterFormData> = async (data) => {
    try {
      const result = await signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success("Compte créé ! Connexion en cours...");
      await onLogin({ email: data.email, password: data.password });
    } catch (error: any) {
      toast.error(error.message || "Échec de l'enregistrement.");
    }
  };

  const onLogin: SubmitHandler<LoginFormData> = async (data) => {
    try {
      const result = await signIn.email({
        email: data.email,
        password: data.password,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success("Connecté avec succès ! Redirection...");
      router.push("/admin");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Échec de la connexion.");
    }
  };

  const isLoading = isLoginSubmitting || isRegisterSubmitting;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="p-8 bg-slate-900 border border-slate-800 shadow-2xl shadow-black/20">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as FormType)}
          >
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-800 border-slate-700">
              <TabsTrigger
                value="login"
                className="data-[state=active]:bg-slate-700 text-white"
              >
                Sign In
              </TabsTrigger>
              {canRegister && (
                <TabsTrigger
                  value="register"
                  className="data-[state=active]:bg-slate-700 text-white"
                >
                  Sign Up
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="login" className="mt-0">
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <form
                  onSubmit={handleLoginSubmit(onLogin)}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-slate-300">
                      Email
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
                      <Input
                        id="login-email"
                        type="email"
                        {...registerLogin("email")}
                        className="pl-11 h-12 bg-slate-800 text-white placeholder:text-slate-400"
                      />
                    </div>
                    {loginErrors.email && (
                      <p className="text-sm text-red-500 pt-1">
                        {loginErrors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-slate-300">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        {...registerLogin("password")}
                        className="pl-11 pr-12 h-12 bg-slate-800 text-white placeholder:text-slate-400"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1.5"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {loginErrors.password && (
                      <p className="text-sm text-red-500 pt-1">
                        {loginErrors.password.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </motion.div>
            </TabsContent>

            {canRegister && (
              <TabsContent value="register" className="mt-0">
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <form
                    onSubmit={handleRegisterSubmit(onRegister)}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label
                        htmlFor="register-email"
                        className="text-slate-300"
                      >
                        Email
                      </Label>
                      <Input
                        id="register-email"
                        type="email"
                        {...registerRegister("email")}
                        className="h-12 bg-slate-800 text-white placeholder:text-slate-400"
                      />
                      {registerErrors.email && (
                        <p className="text-sm text-red-500 pt-1">
                          {registerErrors.email.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="username-register"
                        className="text-slate-300"
                      >
                        Username
                      </Label>
                      <Input
                        id="username-register"
                        {...registerRegister("name")}
                        className="h-12 bg-slate-800 text-white placeholder:text-slate-400"
                      />
                      {registerErrors.name && (
                        <p className="text-sm text-red-500 pt-1">
                          {registerErrors.name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="password-register"
                        className="text-slate-300"
                      >
                        Password
                      </Label>
                      <Input
                        id="password-register"
                        type="password"
                        {...registerRegister("password")}
                        className="h-12 bg-slate-800 text-white placeholder:text-slate-400"
                      />
                      {registerErrors.password && (
                        <p className="text-sm text-red-500 pt-1">
                          {registerErrors.password.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="confirm-password-register"
                        className="text-slate-300"
                      >
                        Confirm Password
                      </Label>
                      <Input
                        id="confirm-password-register"
                        type="password"
                        {...registerRegister("confirmPassword")}
                        className="h-12 bg-slate-800 text-white placeholder:text-slate-400"
                      />
                      {registerErrors.confirmPassword && (
                        <p className="text-sm text-red-500 pt-1">
                          {registerErrors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="invitation-key"
                        className="text-slate-300"
                      >
                        Clé d'invitation
                      </Label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
                        <Input
                          id="invitation-key"
                          {...registerRegister("invitationKey")}
                          className="pl-11 h-12 bg-slate-800 text-white placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-12"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      ) : (
                        "Créer un compte"
                      )}
                    </Button>
                  </form>
                </motion.div>
              </TabsContent>
            )}
          </Tabs>
        </Card>
      </motion.div>
    </div>
  );
}
