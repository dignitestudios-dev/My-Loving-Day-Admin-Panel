"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { RESET_EMAIL_KEY } from "@/lib/constants/reset-password";
import { useVerifyOtpMutation } from "@/hooks/use-verify-otp";
import { useForgotPasswordMutation } from "@/hooks/use-forgot-password";

const OTP_LENGTH = 5;
const RESEND_COOLDOWN = 60;

export default function VerificationForm() {
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [email, setEmail] = useState("");
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const verifyOtpMutation = useVerifyOtpMutation();
  const resendOtpMutation = useForgotPasswordMutation({ skipRedirect: true });

  useEffect(() => {
    const emailFromQuery = searchParams.get("email");
    const emailFromStorage =
      typeof window !== "undefined"
        ? sessionStorage.getItem(RESET_EMAIL_KEY)
        : null;
    const resolvedEmail = emailFromQuery || emailFromStorage || "";

    if (!resolvedEmail) {
      toast.error("Please enter your email first");
      router.replace("/auth/forgot-password");
      return;
    }

    setEmail(resolvedEmail);
  }, [router, searchParams]);

  useEffect(() => {
    if (resendTimer <= 0) return;

    const interval = setInterval(() => {
      setResendTimer((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value;

    if (!/^\d*$/.test(value) || value.length > 1) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {
      e.preventDefault();

      const newOtp = [...otp];
      if (otp[index]) {
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;

    const newOtp = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((digit, index) => {
      newOtp[index] = digit;
    });
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH) - 1]?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");

    if (!email) {
      toast.error("Email is missing. Please restart the reset flow.");
      router.replace("/auth/forgot-password");
      return;
    }

    if (otpCode.length !== OTP_LENGTH) {
      toast.error("Please enter the complete OTP");
      return;
    }

    verifyOtpMutation.mutate({
      email,
      otp: Number(otpCode),
    });
  };

  const handleResendOtp = () => {
    if (!email) {
      toast.error("Email is missing. Please restart the reset flow.");
      router.replace("/auth/forgot-password");
      return;
    }

    if (resendTimer > 0) return;

    setOtp(Array(OTP_LENGTH).fill(""));
    resendOtpMutation.mutate(
      { email },
      {
        onSuccess: () => {
          setResendTimer(RESEND_COOLDOWN);
        },
      }
    );
  };

  const isComplete = otp.every((digit) => digit !== "");
  const isBusy = verifyOtpMutation.isPending || resendOtpMutation.isPending;

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-3xl font-bold text-gray-900">Verify Your Email</h2>
        <p className="text-gray-600">
          We&apos;ve sent a {OTP_LENGTH}-digit code to{" "}
          <span className="font-medium text-gray-900">
            {email || "your email"}
          </span>
          . Enter it below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              disabled={isBusy}
              className="h-12 w-12 rounded-lg border border-gray-300 text-center text-2xl font-bold focus:border-transparent focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-60"
              aria-label={`OTP digit ${index + 1}`}
            />
          ))}
        </div>

        <Button
          type="submit"
          className="mx-auto block w-fit min-w-40"
          disabled={!isComplete || isBusy}
        >
          {verifyOtpMutation.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify OTP"
          )}
        </Button>

        <div className="text-center">
          {resendTimer > 0 ? (
            <p className="text-sm text-gray-600">
              Resend OTP{" "}
              <span className="font-semibold text-primary">
                {String(Math.floor(resendTimer / 60)).padStart(2, "0")}:
                {String(resendTimer % 60).padStart(2, "0")}
              </span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isBusy || !email}
              className="text-sm text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-60"
            >
              {resendOtpMutation.isPending ? "Sending OTP..." : "Resend OTP"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
