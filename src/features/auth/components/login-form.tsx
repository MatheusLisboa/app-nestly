"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { appConfig } from "@/config/app";
import { getPublicEnv, isSupabaseConfigured } from "@/config/env";
import {
  type SignInInput,
  type SignUpInput,
  signInSchema,
  signUpSchema,
} from "@/features/auth/schemas/auth";
import { Button } from "@/features/shared/components/ui/button";
import { Input } from "@/features/shared/components/ui/input";
import { Label } from "@/features/shared/components/ui/label";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type AuthMode = "signIn" | "signUp";

interface LoginFormProps {
  initialError?: string | null;
}

export function LoginForm({ initialError = null }: LoginFormProps) {
  const t = useTranslations("auth");
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signIn");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(
    initialError ? humanizeAuthError(initialError, t("errorGeneric")) : null,
  );
  const configured = isSupabaseConfigured();

  const signInForm = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const signUpForm = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  function authRedirectTo() {
    const env = getPublicEnv();
    return env.NEXT_PUBLIC_SUPABASE_AUTH_REDIRECT_URL ?? `${window.location.origin}/auth/callback`;
  }

  function switchMode(next: AuthMode) {
    setMode(next);
    setFormError(null);
    setInfoMessage(null);
  }

  async function handleGoogle() {
    if (!configured) return;
    setFormError(null);
    setInfoMessage(null);
    setGoogleLoading(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: authRedirectTo() },
      });

      if (error) {
        setFormError(error.message);
        setGoogleLoading(false);
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : t("errorGeneric"));
      setGoogleLoading(false);
    }
  }

  async function onSignIn(values: SignInInput) {
    if (!configured) return;
    setFormError(null);
    setInfoMessage(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        setFormError(error.message);
        return;
      }

      if (data.user) {
        await supabase.from("profiles").upsert(
          {
            id: data.user.id,
            email: values.email,
            display_name:
              (data.user.user_metadata?.full_name as string | undefined) ??
              (data.user.user_metadata?.name as string | undefined) ??
              values.email.split("@")[0] ??
              null,
            avatar_url: (data.user.user_metadata?.avatar_url as string | undefined) ?? null,
            locale: appConfig.defaultLocale,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" },
        );
      }

      router.replace("/");
      router.refresh();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : t("errorGeneric"));
    }
  }

  async function onSignUp(values: SignUpInput) {
    if (!configured) return;
    setFormError(null);
    setInfoMessage(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: authRedirectTo(),
          data: {
            full_name: values.displayName,
            name: values.displayName,
          },
        },
      });

      if (error) {
        setFormError(error.message);
        return;
      }

      if (data.user) {
        await supabase.from("profiles").upsert(
          {
            id: data.user.id,
            email: values.email,
            display_name: values.displayName,
            avatar_url: null,
            locale: appConfig.defaultLocale,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" },
        );
      }

      // If email confirmation is enabled, session may be null.
      if (!data.session) {
        setInfoMessage(t("confirmEmail"));
        setMode("signIn");
        signInForm.setValue("email", values.email);
        return;
      }

      router.replace("/");
      router.refresh();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : t("errorGeneric"));
    }
  }

  const busy =
    googleLoading || signInForm.formState.isSubmitting || signUpForm.formState.isSubmitting;

  return (
    <div className="mx-auto w-full space-y-6 sm:space-y-7">
      <div className="space-y-1.5 text-center sm:text-left">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-[1.75rem]">
          {mode === "signIn" ? t("welcomeBack") : t("createAccount")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {mode === "signIn" ? t("welcomeBackHint") : t("createAccountSubtitle")}
        </p>
      </div>

      {!configured ? (
        <p
          className="rounded-2xl border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground"
          role="status"
        >
          {t("supabaseNotConfigured")}
        </p>
      ) : null}

      <div className="space-y-4">
        <Button
          type="button"
          className="w-full"
          variant="outline"
          size="lg"
          disabled={!configured || busy}
          onClick={handleGoogle}
        >
          {googleLoading ? <Loader2 className="animate-spin" /> : null}
          {t("signInWithGoogle")}
        </Button>

        <div className="relative py-1 text-center text-xs font-medium text-muted-foreground">
          <span className="relative z-10 bg-card px-3">{t("orEmail")}</span>
          <span
            className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border"
            aria-hidden
          />
        </div>

        {mode === "signIn" ? (
          <form className="space-y-3.5" onSubmit={signInForm.handleSubmit(onSignIn)} noValidate>
            <div className="space-y-2">
              <Label htmlFor="signin-email">{t("emailLabel")}</Label>
              <Input
                id="signin-email"
                type="email"
                autoComplete="email"
                inputMode="email"
                autoCapitalize="none"
                placeholder={t("emailPlaceholder")}
                disabled={!configured || busy}
                {...signInForm.register("email")}
              />
              {signInForm.formState.errors.email ? (
                <p className="text-xs text-destructive" role="alert">
                  {signInForm.formState.errors.email.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="signin-password">{t("passwordLabel")}</Label>
              <Input
                id="signin-password"
                type="password"
                autoComplete="current-password"
                placeholder={t("passwordPlaceholder")}
                disabled={!configured || busy}
                {...signInForm.register("password")}
              />
              {signInForm.formState.errors.password ? (
                <p className="text-xs text-destructive" role="alert">
                  {signInForm.formState.errors.password.message}
                </p>
              ) : null}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={!configured || busy}>
              {signInForm.formState.isSubmitting ? <Loader2 className="animate-spin" /> : null}
              {t("signIn")}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {t("noAccount")}{" "}
              <button
                type="button"
                className="font-semibold text-primary underline-offset-4 hover:underline"
                onClick={() => switchMode("signUp")}
              >
                {t("signUp")}
              </button>
            </p>
          </form>
        ) : (
          <form className="space-y-3.5" onSubmit={signUpForm.handleSubmit(onSignUp)} noValidate>
            <div className="space-y-2">
              <Label htmlFor="signup-name">{t("displayNameLabel")}</Label>
              <Input
                id="signup-name"
                type="text"
                autoComplete="name"
                placeholder={t("displayNamePlaceholder")}
                disabled={!configured || busy}
                {...signUpForm.register("displayName")}
              />
              {signUpForm.formState.errors.displayName ? (
                <p className="text-xs text-destructive" role="alert">
                  {signUpForm.formState.errors.displayName.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-email">{t("emailLabel")}</Label>
              <Input
                id="signup-email"
                type="email"
                autoComplete="email"
                inputMode="email"
                autoCapitalize="none"
                placeholder={t("emailPlaceholder")}
                disabled={!configured || busy}
                {...signUpForm.register("email")}
              />
              {signUpForm.formState.errors.email ? (
                <p className="text-xs text-destructive" role="alert">
                  {signUpForm.formState.errors.email.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-password">{t("passwordLabel")}</Label>
              <Input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                placeholder={t("passwordPlaceholder")}
                disabled={!configured || busy}
                {...signUpForm.register("password")}
              />
              {signUpForm.formState.errors.password ? (
                <p className="text-xs text-destructive" role="alert">
                  {signUpForm.formState.errors.password.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-confirm">{t("confirmPasswordLabel")}</Label>
              <Input
                id="signup-confirm"
                type="password"
                autoComplete="new-password"
                placeholder={t("confirmPasswordPlaceholder")}
                disabled={!configured || busy}
                {...signUpForm.register("confirmPassword")}
              />
              {signUpForm.formState.errors.confirmPassword ? (
                <p className="text-xs text-destructive" role="alert">
                  {signUpForm.formState.errors.confirmPassword.message}
                </p>
              ) : null}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={!configured || busy}>
              {signUpForm.formState.isSubmitting ? <Loader2 className="animate-spin" /> : null}
              {t("createAccount")}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {t("hasAccount")}{" "}
              <button
                type="button"
                className="font-semibold text-primary underline-offset-4 hover:underline"
                onClick={() => switchMode("signIn")}
              >
                {t("signIn")}
              </button>
            </p>
          </form>
        )}

        {infoMessage ? (
          <p
            className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground"
            role="status"
          >
            {infoMessage}
          </p>
        ) : null}

        {formError ? (
          <p
            className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            {formError}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function humanizeAuthError(value: string, fallback: string) {
  try {
    const decoded = decodeURIComponent(value);
    if (decoded === "missing_code" || decoded === "auth_callback") {
      return fallback;
    }
    return decoded;
  } catch {
    return fallback;
  }
}
