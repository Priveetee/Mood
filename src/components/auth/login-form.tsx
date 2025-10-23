"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Lock, Eye, EyeOff, KeyRound } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [registerUsername, setRegisterUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [invitationKey, setInvitationKey] = useState("");

  const [passwordError, setPasswordError] = useState("");
  const [canRegister, setCanRegister] = useState(false);

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

  useEffect(() => {
    if (
      registerPassword &&
      confirmPassword &&
      registerPassword !== confirmPassword
    ) {
      setPasswordError("Les mots de passe ne correspondent pas.");
    } else {
      setPasswordError("");
    }
  }, [registerPassword, confirmPassword]);

  const handleRegisterSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setIsLoading(true);
    setPasswordError("");

    if (registerPassword !== confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: registerEmail,
          username: registerUsername,
          password: registerPassword,
          invitationKey: invitationKey,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur d'enregistrement");
      }

      toast.success("Compte créé avec succès !");
      router.push("/admin");
    } catch (error: any) {
      toast.error(error.message || "Échec de l'enregistrement.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur de connexion");
      }

      toast.success("Connecté avec succès !");
      router.push("/admin");
    } catch (error: any) {
      toast.error(error.message || "Échec de la connexion.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="p-8 bg-slate-900 border border-slate-800 shadow-2xl shadow-black/20">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-800 border-slate-700">
              <TabsTrigger
                value="login"
                className="text-sm font-medium data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100 text-slate-400"
              >
                Sign In
              </TabsTrigger>
              {canRegister && (
                <TabsTrigger
                  value="register"
                  className="text-sm font-medium data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100 text-slate-400"
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
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <form onSubmit={handleLoginSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="login-email"
                      className="text-slate-300 font-medium"
                    >
                      Email
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
                      <Input
                        id="login-email"
                        type="email"
                        autoComplete="email"
                        placeholder="your@email.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-11 h-12 bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="login-password"
                      className="text-slate-300 font-medium"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-11 pr-12 h-12 bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-10 w-10 p-0 hover:bg-slate-700 text-slate-500 hover:text-slate-300"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold bg-slate-100 hover:bg-slate-200 text-slate-900"
                    disabled={isLoading || !loginEmail || !loginPassword}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-slate-800 border-t-transparent rounded-full animate-spin" />
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
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  <form onSubmit={handleRegisterSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="register-email"
                        className="text-slate-300 font-medium"
                      >
                        Email
                      </Label>
                      <Input
                        id="register-email"
                        type="email"
                        autoComplete="email"
                        placeholder="your@email.com"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className="h-12 bg-slate-800 border-slate-700 text-slate-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="username-register"
                        className="text-slate-300 font-medium"
                      >
                        Username
                      </Label>
                      <Input
                        id="username-register"
                        autoComplete="username"
                        placeholder="Choose a username"
                        value={registerUsername}
                        onChange={(e) => setRegisterUsername(e.target.value)}
                        className="h-12 bg-slate-800 border-slate-700 text-slate-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="password-register"
                        className="text-slate-300 font-medium"
                      >
                        Password
                      </Label>
                      <Input
                        id="password-register"
                        type="password"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="h-12 bg-slate-800 border-slate-700 text-slate-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="confirm-password-register"
                        className="text-slate-300 font-medium"
                      >
                        Confirm Password
                      </Label>
                      <Input
                        id="confirm-password-register"
                        type="password"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-12 bg-slate-800 border-slate-700 text-slate-100"
                      />
                      {passwordError && (
                        <p className="text-sm text-red-500 pt-1">
                          {passwordError}
                        </p>
                      )}
                    </div>

                    {canRegister && (
                      <div className="space-y-2">
                        <Label
                          htmlFor="invitation-key"
                          className="text-slate-300 font-medium"
                        >
                          Clé d&apos;invitation (requise si c&apos;est le
                          premier compte)
                        </Label>
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
                          <Input
                            id="invitation-key"
                            type="text"
                            placeholder="Entrez la clé d'invitation"
                            value={invitationKey}
                            onChange={(e) => setInvitationKey(e.target.value)}
                            className="pl-11 h-12 bg-slate-800 border-slate-700 text-slate-100"
                          />
                        </div>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-12 bg-slate-100 hover:bg-slate-200 text-slate-900"
                      disabled={
                        isLoading ||
                        !!passwordError ||
                        !registerUsername ||
                        !registerEmail ||
                        !registerPassword ||
                        !confirmPassword
                      }
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-slate-800 border-t-transparent rounded-full animate-spin" />
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
