"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthMode = "login" | "signup" | "forgot";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const supabase = createClient();

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/");
        router.refresh();
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage({ text: "Check your email to confirm your account!", type: "success" });
        setLoading(false);
        return;
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });
        if (error) throw error;
        setMessage({ text: "Check your email for the reset link!", type: "success" });
        setLoading(false);
        return;
      }
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "An error occurred", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (mode === "login") return "Welcome back";
    if (mode === "signup") return "Create account";
    return "Reset password";
  };

  const getDescription = () => {
    if (mode === "login") return "Sign in to your SpendTracker account";
    if (mode === "signup") return "Sign up to start tracking your spending";
    return "Enter your email to receive a reset link";
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-zinc-800">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{getTitle()}</CardTitle>
          <CardDescription>{getDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              {/* Email */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="border-zinc-700"
                />
              </div>

              {/* Password - hide for forgot mode */}
              {mode !== "forgot" && (
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    {mode === "login" && (
                      <button
                        type="button"
                        className="ml-auto text-sm text-muted-foreground underline-offset-4 hover:underline"
                        onClick={() => {
                          setMode("forgot");
                          setMessage(null);
                        }}
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                    className="border-zinc-700"
                  />
                </div>
              )}

              {/* Message */}
              {message && (
                <p className={cn(
                  "text-sm text-center",
                  message.type === "success" ? "text-income" : "text-expense"
                )}>
                  {message.text}
                </p>
              )}

              {/* Submit */}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? "Loading..."
                  : mode === "login"
                  ? "Sign in"
                  : mode === "signup"
                  ? "Sign up"
                  : "Send reset link"}
              </Button>

              {/* Toggle mode */}
              <p className="text-center text-sm text-muted-foreground">
                {mode === "login" && (
                  <>
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      className="underline underline-offset-4 hover:text-primary"
                      onClick={() => {
                        setMode("signup");
                        setMessage(null);
                      }}
                    >
                      Sign up
                    </button>
                  </>
                )}
                {mode === "signup" && (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      className="underline underline-offset-4 hover:text-primary"
                      onClick={() => {
                        setMode("login");
                        setMessage(null);
                      }}
                    >
                      Sign in
                    </button>
                  </>
                )}
                {mode === "forgot" && (
                  <>
                    Remember your password?{" "}
                    <button
                      type="button"
                      className="underline underline-offset-4 hover:text-primary"
                      onClick={() => {
                        setMode("login");
                        setMessage(null);
                      }}
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
