"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { login, signup, loginWithGoogle } from "./actions";

// ─── Google SVG icon ────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
        fill="#EA4335"
      />
      <path
        d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
        fill="#4285F4"
      />
      <path
        d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
        fill="#FBBC05"
      />
      <path
        d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
        fill="#34A853"
      />
    </svg>
  );
}

// ─── Tab Button ─────────────────────────────────────────────

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
        active
          ? "bg-indigo-600 text-white shadow-sm"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}

// ─── Auth Form ──────────────────────────────────────────────

function AuthForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const initialTab = searchParams.get("tab") === "register" ? "register" : "signin";

  // We use a URL param approach rather than useState so the tab persists on redirect
  const activeTab = initialTab;

  function setTab(tab: string) {
    const url = new URL(window.location.href);
    if (tab === "register") {
      url.searchParams.set("tab", "register");
    } else {
      url.searchParams.delete("tab");
    }
    url.searchParams.delete("error");
    window.history.replaceState({}, "", url.toString());
    window.location.href = url.toString();
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel — branded */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800" />

        <svg
          viewBox="0 0 1024 1024"
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 -z-0 size-[64rem] -translate-x-1/2 -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
        >
          <circle
            r={512}
            cx={512}
            cy={512}
            fill="url(#login-gradient)"
            fillOpacity="0.25"
          />
          <defs>
            <radialGradient id="login-gradient">
              <stop stopColor="#7775D6" />
              <stop offset={1} stopColor="#E935C1" />
            </radialGradient>
          </defs>
        </svg>

        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <div>
            <div className="flex items-center gap-x-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-white/20 text-white text-sm font-bold backdrop-blur-sm">
                IQ
              </div>
              <span className="text-lg font-semibold text-white">
                Insured IQ
              </span>
            </div>
          </div>

          <div className="max-w-md">
            <h1 className="text-4xl font-semibold tracking-tight text-white">
              Start your free trial
            </h1>
            <p className="mt-4 text-lg text-indigo-100">
              Set up your branded insurance company in minutes. White-label
              products, automated underwriting, and beautiful customer
              experiences — all powered by Insured IQ.
            </p>
            <div className="mt-8 flex items-center gap-x-6">
              <div className="flex -space-x-2">
                {["bg-indigo-300", "bg-pink-300", "bg-amber-300", "bg-emerald-300"].map((bg, i) => (
                  <div
                    key={i}
                    className={`size-8 rounded-full ${bg} ring-2 ring-indigo-600`}
                  />
                ))}
              </div>
              <span className="text-sm text-indigo-200">
                Trusted by 50+ insurance brands
              </span>
            </div>
          </div>

          <p className="text-sm text-indigo-300">
            © 2026 Insured IQ. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Mobile logo */}
          <div className="lg:hidden">
            <div className="flex items-center gap-x-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-600 text-white text-sm font-bold">
                IQ
              </div>
              <span className="text-lg font-semibold text-gray-900">
                Insured IQ
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="lg:mt-0 mt-8">
            <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
              <TabButton active={activeTab === "signin"} onClick={() => setTab("signin")}>
                Sign in
              </TabButton>
              <TabButton active={activeTab === "register"} onClick={() => setTab("register")}>
                Create account
              </TabButton>
            </div>
          </div>

          <div className="mt-6">
            {/* Error message */}
            {error && (
              <div className="mb-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-200 ring-inset">
                {error}
              </div>
            )}

            {activeTab === "signin" ? (
              <>
                {/* Sign In Form */}
                <form action={login} className="space-y-5">
                  <div>
                    <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                      Email address
                    </label>
                    <div className="mt-1.5">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="you@company.com"
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                      Password
                    </label>
                    <div className="mt-1.5">
                      <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        autoComplete="current-password"
                        placeholder="••••••••"
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Sign in
                  </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-500">
                  Don&apos;t have an account?{" "}
                  <button onClick={() => setTab("register")} className="font-semibold text-indigo-600 hover:text-indigo-500">
                    Create one
                  </button>
                </p>
              </>
            ) : (
              <>
                {/* Create Account Form */}
                <form action={signup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="firstName" className="block text-sm/6 font-medium text-gray-900">
                        First name
                      </label>
                      <div className="mt-1.5">
                        <input
                          id="firstName"
                          name="firstName"
                          type="text"
                          required
                          autoComplete="given-name"
                          placeholder="John"
                          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm/6 font-medium text-gray-900">
                        Last name
                      </label>
                      <div className="mt-1.5">
                        <input
                          id="lastName"
                          name="lastName"
                          type="text"
                          required
                          autoComplete="family-name"
                          placeholder="Smith"
                          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="signupEmail" className="block text-sm/6 font-medium text-gray-900">
                      Email address
                    </label>
                    <div className="mt-1.5">
                      <input
                        id="signupEmail"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="you@company.com"
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="signupPassword" className="block text-sm/6 font-medium text-gray-900">
                      Password
                    </label>
                    <div className="mt-1.5">
                      <input
                        id="signupPassword"
                        name="password"
                        type="password"
                        required
                        autoComplete="new-password"
                        placeholder="Min. 6 characters"
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm/6 font-medium text-gray-900">
                      Confirm password
                    </label>
                    <div className="mt-1.5">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        autoComplete="new-password"
                        placeholder="••••••••"
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Create account
                  </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-500">
                  Already have an account?{" "}
                  <button onClick={() => setTab("signin")} className="font-semibold text-indigo-600 hover:text-indigo-500">
                    Sign in
                  </button>
                </p>
              </>
            )}

            {/* Divider */}
            <div className="mt-8">
              <div className="relative">
                <div aria-hidden="true" className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm/6 font-medium">
                  <span className="bg-white px-6 text-gray-900">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google OAuth */}
              <div className="mt-6">
                <form action={loginWithGoogle}>
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus-visible:ring-transparent"
                  >
                    <GoogleIcon />
                    <span className="text-sm/6 font-semibold">Google</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────

export default function LoginPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}
