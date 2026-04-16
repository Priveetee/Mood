"use client";

import { Eye, EyeOff, Lock, User } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginFieldsProps = {
  email: UseFormRegisterReturn<"email">;
  password: UseFormRegisterReturn<"password">;
  emailError?: string;
  passwordError?: string;
  showPassword: boolean;
  onTogglePassword: () => void;
};

export function LoginFormFields({
  email,
  password,
  emailError,
  passwordError,
  showPassword,
  onTogglePassword,
}: LoginFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="login-email" className="text-slate-300">
          Email
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
          <Input
            id="login-email"
            type="email"
            {...email}
            className="pl-11 h-12 bg-slate-800 text-white"
          />
        </div>
        {emailError && <p className="pt-1 text-sm text-red-500">{emailError}</p>}
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
            {...password}
            className="pl-11 pr-12 h-12 bg-slate-800 text-white"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1.5"
            onClick={onTogglePassword}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        {passwordError && <p className="pt-1 text-sm text-red-500">{passwordError}</p>}
      </div>
    </>
  );
}
