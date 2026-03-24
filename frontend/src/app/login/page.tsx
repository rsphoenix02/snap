"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { CharacterScene } from "@/components/ui/animated-characters";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const err = await login(email, password);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Panel — Characters */}
      <div className="relative hidden lg:flex flex-col justify-between bg-zinc-950 p-12 overflow-hidden">
        <div className="relative z-20">
          <Link href="/" className="inline-flex items-center gap-2 text-lg font-semibold">
            <Zap className="size-5 text-red-500 fill-red-500" />
            <span className="text-white tracking-tighter">SNAP</span>
          </Link>
        </div>

        <div className="relative z-20 flex items-end justify-center h-[500px]">
          <CharacterScene
            isTyping={isTyping}
            password={password}
            showPassword={showPassword}
          />
        </div>

        <div className="relative z-20" />

        {/* Decorative blurs */}
        <div className="absolute top-1/4 right-1/4 size-64 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/3 size-80 bg-red-500/5 rounded-full blur-3xl" />
      </div>

      {/* Right Panel — Form */}
      <div className="flex items-center justify-center p-8 bg-[#0A0A0A]">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-12">
            <Link href="/" className="inline-flex items-center gap-2">
              <Zap className="size-6 text-red-500 fill-red-500" />
              <span className="text-xl font-semibold tracking-tighter text-white">SNAP</span>
            </Link>
          </div>

          {/* Desktop back link */}
          <Link
            href="/"
            className="hidden lg:inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-8"
          >
            <ArrowLeft className="size-4" />
            Back to home
          </Link>

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
              Welcome back!
            </h1>
            <p className="text-zinc-500 text-sm">Enter your credentials to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
                required
                autoComplete="off"
                placeholder="you@example.com"
                className="w-full h-12 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full h-12 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 pr-10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-900/30 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-lg bg-red-500 text-sm font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              Log In
            </button>
          </form>

          {/* Footer links */}
          <div className="flex flex-col items-center gap-4 mt-8">
            <p className="text-sm text-zinc-500">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-red-400 hover:text-red-300 font-medium transition-colors">
                Sign up
              </Link>
            </p>
            <Link
              href="/"
              className="lg:hidden text-sm text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
