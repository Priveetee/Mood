"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginForm() {
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading] = useState(false);
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

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
              <TabsTrigger
                value="register"
                className="text-sm font-medium data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100 text-slate-400"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-0">
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-slate-300 font-medium">
                    Username
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
                    <Input
                      id="username"
                      type="text"
                      autoComplete="username"
                      placeholder="your_username"
                      className="pl-11 h-12 bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-300 font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
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
                  className="w-full h-12 text-base font-semibold bg-slate-100 hover:bg-slate-200 text-slate-900"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-slate-800 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </motion.div>
            </TabsContent>

            <TabsContent value="register" className="mt-0">
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
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
                    <p className="text-sm text-red-500 pt-1">{passwordError}</p>
                  )}
                </div>

                <Button
                  className="w-full h-12 bg-slate-100 hover:bg-slate-200 text-slate-900"
                  disabled={isLoading || !!passwordError}
                >
                  Create Account
                </Button>
              </motion.div>
            </TabsContent>
          </Tabs>
        </Card>
      </motion.div>
    </div>
  );
}
