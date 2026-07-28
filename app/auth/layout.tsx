"use client";

import { Logo } from "@/components/logo";
import { PublicRoute } from "@/components/PublicRoute";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PublicRoute>
      <div className="flex h-screen">
        <div className="flex flex-1 items-center justify-center p-8">
          {children}
        </div>
        <div
          className="hidden h-full w-full items-center bg-cover bg-center bg-no-repeat lg:grid lg:w-1/2"
          style={{ backgroundImage: "url('/images/loginbg.png')" }}
        >
          <div className="relative z-1 flex items-center justify-center">
            <div className="flex max-w-xs flex-col items-center">
              <div className="mb-4 flex items-center justify-center rounded-2xl bg-white p-4 shadow-sm">
                <Logo size={120} />
              </div>
              <h1 className="text-4xl font-semibold text-white">My Loving Day</h1>
              <p className="mt-2 text-center text-white/70">
                Welcome to the Admin Panel.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicRoute>
  );
}
