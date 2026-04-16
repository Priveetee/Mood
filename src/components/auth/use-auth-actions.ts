"use client";

import { useRouter } from "next/navigation";
import type { SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import { signIn } from "@/lib/auth-client";
import type { LoginFormData, RegisterFormData } from "@/lib/schemas";

type AuthApiError = {
  message?: string;
};

type AuthApiSuccess = {
  user?: {
    id: string;
  };
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractErrorMessage(payload: unknown): string {
  if (!isObject(payload)) {
    return "Echec de l'enregistrement.";
  }

  const message = (payload as AuthApiError).message;
  if (typeof message === "string" && message.length > 0) {
    return message;
  }

  return "Echec de l'enregistrement.";
}

function isAuthSuccess(payload: unknown): payload is AuthApiSuccess {
  if (!isObject(payload)) {
    return false;
  }
  const user = payload.user;
  return isObject(user) && typeof user.id === "string";
}

export function useAuthActions() {
  const router = useRouter();

  const onLogin: SubmitHandler<LoginFormData> = async (data) => {
    try {
      const result = await signIn.email({
        email: data.email,
        password: data.password,
      });
      if (result.error) {
        throw new Error(result.error.message);
      }
      toast.success("Connecte avec succes ! Redirection...");
      router.push("/admin");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Echec de la connexion.";
      toast.error(message);
    }
  };

  const onRegister: SubmitHandler<RegisterFormData> = async (data) => {
    const invitationKey = data.invitationKey?.trim();
    if (!invitationKey) {
      toast.error("La cle d'invitation est requise.");
      return;
    }

    try {
      const response = await fetch("/api/auth/sign-up/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          invitationKey,
        }),
      });

      const payload = (await response.json()) as unknown;

      if (!response.ok) {
        throw new Error(extractErrorMessage(payload));
      }

      if (!isAuthSuccess(payload)) {
        throw new Error("Reponse d'inscription invalide.");
      }

      toast.success("Compte cree ! Redirection...");
      router.push("/admin");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Echec de l'enregistrement.";
      toast.error(message);
    }
  };

  return { onLogin, onRegister };
}
