"use client";

import { Suspense } from "react";
import VerificationForm from "./verification-form";

export default function VerificationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex w-full max-w-md items-center justify-center py-20">
          <div className="border-primary size-8 animate-spin rounded-full border-2 border-t-transparent" />
        </div>
      }
    >
      <VerificationForm />
    </Suspense>
  );
}
