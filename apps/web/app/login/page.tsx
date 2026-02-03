"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Lock, ArrowRight, Github, Mail } from "lucide-react";
import { deriveKey, generateSalt, setEncryptionKey } from "@/lib/crypto";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [masterPassword, setMasterPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"email" | "password">("email");
  const [error, setError] = useState<string | null>(null);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // In production: send magic link or check if user exists
    setStep("password");
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterPassword) return;

    setIsLoading(true);
    setError(null);

    try {
      // Derive encryption key from master password
      // This key NEVER leaves the browser
      const salt = generateSalt();
      const encryptionKey = await deriveKey(masterPassword, salt);

      // Store key in memory for this session
      setEncryptionKey(encryptionKey, salt);

      // Store email for session
      localStorage.setItem("envvault_email", email);

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      setError("Failed to initialize encryption. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 mb-4">
            <Shield className="h-10 w-10 text-primary-500" />
            <span className="text-2xl font-bold">EnvVault</span>
          </a>
          <h1 className="text-xl text-zinc-400">
            {step === "email" ? "Sign in to your account" : "Enter your master password"}
          </h1>
        </div>

        {/* Login Card */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          {step === "email" ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-primary-500 transition"
                    required
                  />
                </div>
              </div>

              {/* Continue Button */}
              <button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-700 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight className="h-5 w-5" />
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-zinc-900 text-zinc-500">or continue with</span>
                </div>
              </div>

              {/* OAuth Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 py-3 rounded-lg transition"
                >
                  <Github className="h-5 w-5" />
                  GitHub
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 py-3 rounded-lg transition"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* Email Display */}
              <div className="bg-zinc-800 rounded-lg px-4 py-3 flex items-center justify-between">
                <span className="text-zinc-400">{email}</span>
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="text-primary-400 hover:text-primary-300 text-sm"
                >
                  Change
                </button>
              </div>

              {/* Master Password Input */}
              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  Master password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                  <input
                    type="password"
                    value={masterPassword}
                    onChange={(e) => setMasterPassword(e.target.value)}
                    placeholder="Enter your master password"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-primary-500 transition"
                    required
                    minLength={8}
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  This password encrypts your secrets locally. We never see it.
                </p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deriving encryption key...
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5" />
                    Unlock Vault
                  </>
                )}
              </button>

              {/* Security Note */}
              <div className="bg-zinc-800/50 rounded-lg p-4 text-sm text-zinc-400">
                <div className="font-medium text-zinc-300 mb-1">Zero-knowledge encryption</div>
                Your master password never leaves this device. All encryption
                happens locally in your browser.
              </div>
            </form>
          )}
        </div>

        {/* Sign up link */}
        <p className="text-center text-zinc-500 text-sm mt-6">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="text-primary-400 hover:text-primary-300">
            Sign up free
          </a>
        </p>
      </div>
    </main>
  );
}
