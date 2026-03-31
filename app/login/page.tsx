"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const canSubmit = email.length > 0 && password.length > 0;

  const handleLogin = () => {
    // TODO: replace with real auth later
    console.log("Logging in with:", { email, password });

    router.push("/");
  };

  return (
    <main className="h-screen overflow-hidden bg-[#eef1ec] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto flex h-full w-full max-w-3xl items-center justify-center">
        <div className="w-full rounded-[28px] bg-[#eef1ec] px-3 py-4 sm:px-6 sm:py-6">
          
          {/* Header */}
          <div className="mb-6 text-center sm:mb-8">
            <h1 className="text-3xl font-light text-[#78806f] sm:text-4xl">
              Welcome Back
            </h1>
            <p className="mt-2 text-xs text-[#7d837a] sm:text-sm">
              Sign in to your account
            </p>
          </div>

          {/* Card */}
          <Card className="mx-auto mt-6 w-full max-w-md rounded-[24px] border-0 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.10)] sm:mt-8">
            <CardContent className="p-6 sm:p-8 space-y-5">

              {/* Email */}
              <div>
                <Label className="mb-2 block text-sm font-medium text-[#4b5049]">
                  Email Address
                </Label>
                <Input
                  type="email"
                  placeholder="j@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 border-[#d9ddd7]"
                />
              </div>

              {/* Password */}
              <div>
                <Label className="mb-2 block text-sm font-medium text-[#4b5049]">
                  Password
                </Label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 border-[#d9ddd7]"
                />
              </div>

              {/* Login button */}
              <Button
                onClick={handleLogin}
                disabled={!canSubmit}
                className="h-12 w-full rounded-xl bg-black text-white hover:opacity-90"
              >
                Sign In
              </Button>

              {/* Back to signup */}
              <p className="text-center text-sm text-[#7d837a]">
                Don’t have an account?{" "}
                <Link href="/sign-up">
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0 font-medium text-[#4d5c49] underline underline-offset-2"
                  >
                    Sign up
                  </Button>
                </Link>
              </p>

            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}