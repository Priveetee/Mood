"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  type LoginFormData,
  loginSchema,
  type RegisterFormData,
  registerSchema,
} from "@/lib/schemas";

export function useAuthForms() {
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  return { loginForm, registerForm };
}
