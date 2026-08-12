"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShieldCheck, Code, Eye, EyeOff, User, Lock, Mail, ArrowRight, Home } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Logo = () => (
  <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/20">
    <ShieldCheck className="w-8 h-8" />
  </div>
);

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("analyst");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError("Please fill out all required fields.");
      return;
    }

    localStorage.setItem("token", "user-token-" + Date.now());
    localStorage.setItem("role", role);
    router.push("/dashboard");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-100 transition-colors font-sans">
      
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>Back to Homepage</span>
      </Link>

      <div className="w-full max-w-md">
        <Card className="border border-emerald-500/30 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 shadow-2xl rounded-2xl overflow-hidden backdrop-blur-xl">
          <CardHeader className="flex flex-col items-center space-y-2 pb-4 pt-6 text-center">
            <Logo />
            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Create NetSentinel-X Account
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Join NetSentinel-X enterprise security workspace
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 px-6 sm:px-8">

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-500/50 text-rose-700 dark:text-rose-300 text-xs font-mono">
                ⚠ {error}
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="role" className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Select SOC Role
                </Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="role" className="bg-slate-50 dark:bg-black border-slate-300 dark:border-zinc-800 text-xs">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-800 text-xs">
                    <SelectItem value="analyst">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-emerald-500" />
                        <span>Security Analyst</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>SOC Administrator</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="engineer">
                      <div className="flex items-center gap-2">
                        <Code className="w-4 h-4 text-teal-500" />
                        <span>Detection Engineer</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-xs font-bold text-slate-700 dark:text-zinc-300">First name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-slate-50 dark:bg-black border-slate-300 dark:border-zinc-800 text-xs"
                    placeholder="Ayush"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-xs font-bold text-slate-700 dark:text-zinc-300">Last name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="bg-slate-50 dark:bg-black border-slate-300 dark:border-zinc-800 text-xs"
                    placeholder="Singh"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-xs font-bold text-slate-700 dark:text-zinc-300">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-slate-50 dark:bg-black border-slate-300 dark:border-zinc-800 text-xs"
                  placeholder="ayush_soc"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold text-slate-700 dark:text-zinc-300">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-50 dark:bg-black border-slate-300 dark:border-zinc-800 text-xs"
                  placeholder="ayush@netsentinel.io"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-bold text-slate-700 dark:text-zinc-300">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10 bg-slate-50 dark:bg-black border-slate-300 dark:border-zinc-800 text-xs"
                    placeholder="••••••••••••"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <Checkbox id="terms" defaultChecked />
                <label htmlFor="terms" className="text-xs text-slate-500 dark:text-zinc-400">
                  I agree to Enterprise{" "}
                  <Link href="/" className="text-emerald-600 dark:text-emerald-400 hover:underline">Terms</Link> &amp;{" "}
                  <Link href="/" className="text-emerald-600 dark:text-emerald-400 hover:underline">Privacy</Link>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg shadow-emerald-500/20"
              >
                Create Enterprise Account
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center border-t border-slate-200 dark:border-zinc-800 py-4 bg-slate-50/50 dark:bg-black/50">
            <p className="text-center text-xs text-slate-500 dark:text-zinc-400">
              Already have an account?{" "}
              <Link href="/login" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export function LoginForm() {
  const [isVisible, setIsVisible] = useState(false);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.csrf_token) {
          localStorage.setItem("csrf_token", data.csrf_token);
        }
        localStorage.setItem("token", data.token || "authenticated");
        localStorage.setItem("role", data.role || "admin");
        router.push("/dashboard");
      } else {
        if (
          (username === "admin" && (password === "admin" || password === "Admin@NetSentinel2026!")) ||
          (username === "analyst" && (password === "analyst" || password === "Analyst@NetSentinel2026!"))
        ) {
          localStorage.setItem("token", `${username}-token`);
          localStorage.setItem("role", username);
          router.push("/dashboard");
        } else {
          setError("Invalid credentials. Try admin/admin or analyst/analyst.");
        }
      }
    } catch {
      if (
        (username === "admin" && (password === "admin" || password === "Admin@NetSentinel2026!")) ||
        (username === "analyst" && (password === "analyst" || password === "Analyst@NetSentinel2026!"))
      ) {
        localStorage.setItem("token", `${username}-token`);
        localStorage.setItem("role", username);
        router.push("/dashboard");
      } else {
        setError("Invalid credentials. Try admin/admin or analyst/analyst.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-100 transition-colors font-sans">
      
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>Back to Homepage</span>
      </Link>

      <div className="w-full max-w-sm space-y-6 bg-white/90 dark:bg-zinc-950/90 p-8 rounded-2xl border border-emerald-500/30 dark:border-zinc-800 shadow-2xl backdrop-blur-xl">
        <div className="space-y-2 text-center">
          <div className="mx-auto w-max p-3 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome to NetSentinel-X
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Sign in to access your SOC dashboard &amp; AI Copilot
          </p>
        </div>

        <div className="bg-slate-100 dark:bg-black/60 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 text-[11px] font-mono space-y-1.5">
          <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold block">Quick Demo Credentials:</span>
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => { setUsername("admin"); setPassword("Admin@NetSentinel2026!"); }}
              className="flex-1 px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-400 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 text-center text-[10px] font-bold"
            >
              admin / Admin@NetSentinel2026!
            </button>
            <button
              type="button"
              onClick={() => { setUsername("analyst"); setPassword("Analyst@NetSentinel2026!"); }}
              className="flex-1 px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-400 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 text-center text-[10px] font-bold"
            >
              analyst / Analyst@NetSentinel2026!
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-500/50 text-rose-700 dark:text-rose-300 text-xs font-mono">
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-xs font-bold text-slate-700 dark:text-zinc-300">Username</Label>
            <div className="relative">
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="ps-9 bg-slate-50 dark:bg-black border-slate-300 dark:border-zinc-800 text-xs"
                placeholder="admin"
              />
              <div className="text-slate-400 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3">
                <Mail size={16} />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-bold text-slate-700 dark:text-zinc-300">Password</Label>
            </div>
            <div className="relative">
              <Input
                id="password"
                className="ps-9 pe-9 bg-slate-50 dark:bg-black border-slate-300 dark:border-zinc-800 text-xs"
                placeholder="Enter password"
                type={isVisible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="text-slate-400 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3">
                <Lock size={16} />
              </div>
              <button
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center"
                type="button"
                onClick={toggleVisibility}
              >
                {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Checkbox id="remember-me" defaultChecked />
            <Label htmlFor="remember-me" className="text-xs text-slate-500 dark:text-zinc-400">Remember session for 30 days</Label>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg shadow-emerald-500/20"
          >
            {loading ? "Authenticating..." : "Sign In to Dashboard"}
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 dark:text-zinc-400 pt-2 border-t border-slate-200 dark:border-zinc-800">
          No account?{" "}
          <Link href="/signup" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
