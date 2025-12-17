"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Provider } from "@supabase/supabase-js";
import { supabaseAuth } from "@/utils/supabase-auth";

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  if (err && typeof err === "object" && "message" in err) {
    const msg = (err as { message?: unknown }).message;
    if (typeof msg === "string") return msg;
  }
  return "Unknown error";
}

export default function SignUpPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirm, setConfirm] = useState<string>("");
  const [agree, setAgree] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const onSignUp = async (): Promise<void> => {
    setError(null);

    if (!agree) return setError("Please accept Terms & Privacy Policy.");
    if (!fullName.trim()) return setError("Full name is required.");
    if (!email.trim()) return setError("Email is required.");
    if (password.length < 6) return setError("Password should be at least 6 characters.");
    if (password !== confirm) return setError("Passwords do not match.");

    setLoading(true);
    try {
      const { data, error } = await supabaseAuth.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });

      if (error) throw error;

      // If email confirmation is ON, session can be null until user confirms email.
      if (!data.session) {
        router.push("/signin");
        return;
      }

      router.push("/");
    } catch (e: unknown) {
      setError(getErrorMessage(e) || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  const onOAuth = async (provider: Provider): Promise<void> => {
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabaseAuth.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/` },
      });
      if (error) throw error;
    } catch (e: unknown) {
      setError(getErrorMessage(e) || "OAuth sign-up failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-700 via-indigo-700 to-blue-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl">
        <div className="flex justify-center pt-10">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 grid place-items-center shadow-lg">
              <svg
                className="h-7 w-7 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M23 7l-7 5 7 5V7z" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </div>
            <span className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-amber-400 grid place-items-center text-xs font-bold text-black shadow">
              ✦
            </span>
          </div>
        </div>

        <div className="px-8 pt-6 text-center">
          <h1 className="text-3xl font-bold text-white">Join StreamHub</h1>
          <p className="mt-2 text-sm text-white/70">Create your streaming account</p>
        </div>

        <div className="px-8 pt-6">
          {error && (
            <div className="mb-4 rounded-xl border border-rose-400/40 bg-rose-500/15 px-4 py-2 text-sm text-rose-200">
              {error}
            </div>
          )}
        </div>

        <form className="px-8 pb-8 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <Input type="text" placeholder="Full name" value={fullName} onChange={setFullName} icon={<IconUser />} />
          <Input type="email" placeholder="Email address" value={email} onChange={setEmail} icon={<IconMail />} />
          <Input type="password" placeholder="Password" value={password} onChange={setPassword} icon={<IconLock />} />
          <Input type="password" placeholder="Confirm password" value={confirm} onChange={setConfirm} icon={<IconLock />} />

          <label className="flex items-start gap-3 pt-1 text-sm text-white/70">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-white/30 bg-white/10 text-pink-500 focus:ring-pink-500/60"
            />
            <span>
              I agree to the{" "}
              <a className="text-white hover:underline" href="#">
                Terms of Service
              </a>{" "}
              and{" "}
              <a className="text-white hover:underline" href="#">
                Privacy Policy
              </a>
            </span>
          </label>

          <button
            type="button"
            disabled={loading}
            onClick={() => void onSignUp()}
            className="mt-2 w-full rounded-xl py-3 font-semibold text-white shadow-lg
                       bg-gradient-to-r from-pink-600 to-red-600 hover:brightness-110 active:brightness-95
                       transition disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>

          <div className="flex items-center gap-4 py-2">
            <div className="h-px flex-1 bg-white/15" />
            <span className="text-xs text-white/60">or</span>
            <div className="h-px flex-1 bg-white/15" />
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={() => void onOAuth("google")}
            className="w-full rounded-xl py-3 font-semibold text-white/80
                       bg-white/10 border border-white/15 hover:bg-white/15 transition disabled:opacity-60"
          >
            <span className="inline-flex items-center justify-center gap-3">
              <GoogleG />
              Continue with Google
            </span>
          </button>

          <p className="pt-4 text-center text-sm text-white/70">
            Already have an account?{" "}
            <Link href="/signin" className="text-pink-300 hover:text-pink-200 hover:underline">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function Input(props: {
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  icon: React.ReactNode;
}) {
  const { type, placeholder, value, onChange, icon } = props;

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-white/50">{icon}</div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/15 bg-white/10 px-12 py-3
                   text-white placeholder:text-white/45 outline-none
                   focus:border-pink-400/50 focus:ring-2 focus:ring-pink-500/25"
      />
    </div>
  );
}

function IconUser() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16v16H4z" />
      <path d="m22 6-10 7L2 6" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V8a5 5 0 0 1 10 0v3" />
    </svg>
  );
}

function GoogleG() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.721 32.657 29.215 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.957 3.043l5.657-5.657C34.22 6.053 29.41 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 16.108 19.008 12 24 12c3.059 0 5.842 1.154 7.957 3.043l5.657-5.657C34.22 6.053 29.41 4 24 4c-7.682 0-14.354 4.337-17.694 10.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.112 0 9.827-1.965 13.343-5.157l-6.163-5.218C29.215 36 26.715 36.9 24 36c-5.195 0-9.691-3.325-11.276-7.946l-6.52 5.022C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.03 12.03 0 0 1-4.123 5.625l.003-.002 6.163 5.218C36.92 39.33 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}
