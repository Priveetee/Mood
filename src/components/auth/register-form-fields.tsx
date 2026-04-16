"use client";

import { KeyRound } from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RegisterFormData } from "@/lib/schemas";

type Props = {
  register: UseFormRegister<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
};

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-slate-300">
        {label}
      </Label>
      {children}
      {error && <p className="pt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export function RegisterFormFields({ register, errors }: Props) {
  return (
    <>
      <Field id="register-email" label="Email" error={errors.email?.message}>
        <Input
          id="register-email"
          type="email"
          {...register("email")}
          className="h-12 bg-slate-800 text-white"
        />
      </Field>

      <Field id="username-register" label="Username" error={errors.name?.message}>
        <Input
          id="username-register"
          {...register("name")}
          className="h-12 bg-slate-800 text-white"
        />
      </Field>

      <Field id="password-register" label="Password" error={errors.password?.message}>
        <Input
          id="password-register"
          type="password"
          {...register("password")}
          className="h-12 bg-slate-800 text-white"
        />
      </Field>

      <Field
        id="confirm-password-register"
        label="Confirm Password"
        error={errors.confirmPassword?.message}
      >
        <Input
          id="confirm-password-register"
          type="password"
          {...register("confirmPassword")}
          className="h-12 bg-slate-800 text-white"
        />
      </Field>

      <Field id="invitation-key" label="Cle d'invitation" error={errors.invitationKey?.message}>
        <div className="relative">
          <KeyRound className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
          <Input
            id="invitation-key"
            {...register("invitationKey")}
            className="pl-11 h-12 bg-slate-800 text-white"
          />
        </div>
      </Field>
    </>
  );
}
