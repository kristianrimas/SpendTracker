import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage() {
  // Check if user is already logged in
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-zinc-950 p-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <h1 className="text-xl font-bold">SpendTracker</h1>
          </div>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
