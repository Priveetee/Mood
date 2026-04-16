"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { publicTrpc } from "@/lib/trpc";
import type { FormType } from "./auth-types";
import { LoginFormFields } from "./login-form-fields";
import { RegisterFormFields } from "./register-form-fields";
import { useAuthActions } from "./use-auth-actions";
import { useAuthForms } from "./use-auth-forms";

export default function LoginForm() {
  const [activeTab, setActiveTab] = useState<FormType>("login");
  const [showPassword, setShowPassword] = useState(false);
  const { data, isError } = publicTrpc.auth.canRegister.useQuery(undefined, {
    staleTime: 60_000,
    gcTime: 600_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const canRegister = data?.canRegister ?? false;
  const { loginForm, registerForm } = useAuthForms();
  const { onLogin, onRegister } = useAuthActions();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const authError = new URLSearchParams(window.location.search).get("auth_error");
    if (authError === "unauthorized") {
      toast.error("Session expirée. Merci de vous reconnecter.");
    }
  }, []);

  useEffect(() => {
    if (isError) {
      toast.error("Erreur de connexion au serveur d'authentification.");
    }
    if (!canRegister && activeTab === "register") {
      setActiveTab("login");
    }
  }, [isError, canRegister, activeTab]);

  const isLoading = loginForm.formState.isSubmitting || registerForm.formState.isSubmitting;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-black/20">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as FormType)}>
            <TabsList className="mb-8 grid w-full grid-cols-2 border-slate-700 bg-slate-800">
              <TabsTrigger value="login" className="text-white data-[state=active]:bg-slate-700">
                Sign In
              </TabsTrigger>
              {canRegister && (
                <TabsTrigger
                  value="register"
                  className="text-white data-[state=active]:bg-slate-700"
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
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-6">
                  <LoginFormFields
                    email={loginForm.register("email")}
                    password={loginForm.register("password")}
                    emailError={loginForm.formState.errors.email?.message}
                    passwordError={loginForm.formState.errors.password?.message}
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword((current) => !current)}
                  />
                  <Button type="submit" className="h-12 w-full" disabled={isLoading}>
                    {isLoading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white" />
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
                  <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                    <RegisterFormFields
                      register={registerForm.register}
                      errors={registerForm.formState.errors}
                    />
                    <Button type="submit" className="h-12 w-full" disabled={isLoading}>
                      {isLoading ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white" />
                      ) : (
                        "Creer un compte"
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
