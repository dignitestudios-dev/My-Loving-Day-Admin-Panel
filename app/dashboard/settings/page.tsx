"use client";

import { useState, type FormEvent } from "react";
import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";

import { PageHeader } from "@/components/admin/page-header";
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
import { useUpdatePasswordMutation } from "@/hooks/use-update-password";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/utils/error";
import {
  validatePasswordUpdate,
  containsEmoji,
  type PasswordUpdateErrors,
} from "@/lib/utils/password";

const emptyForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function SettingsPage() {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<PasswordUpdateErrors>({});
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { mutate: updatePassword, isPending } = useUpdatePasswordMutation();

  const handleCurrentPasswordChange = (value: string) => {
    setForm((prev) => ({ ...prev, currentPassword: value }));
    if (errors.currentPassword) {
      setErrors((prev) => ({
        ...prev,
        currentPassword: !value.trim()
          ? "Current password is required"
          : containsEmoji(value)
          ? "Current password cannot contain emojis or unsupported characters"
          : undefined,
      }));
    }
  };

  const handleNewPasswordChange = (value: string) => {
    setForm((prev) => ({ ...prev, newPassword: value }));
    if (errors.newPassword || errors.confirmPassword) {
      setErrors((prev) => {
        const nextErrors = { ...prev };
        if (prev.newPassword) {
          if (!value.trim()) {
            nextErrors.newPassword = "New password is required";
          } else if (value.length < 8) {
            nextErrors.newPassword = "New password must be at least 8 characters";
          } else if (containsEmoji(value)) {
            nextErrors.newPassword =
              "New password cannot contain emojis or unsupported characters";
          } else if (form.currentPassword && value === form.currentPassword) {
            nextErrors.newPassword =
              "New password must be different from the current password";
          } else {
            delete nextErrors.newPassword;
          }
        }
        if (prev.confirmPassword && form.confirmPassword) {
          if (form.confirmPassword !== value) {
            nextErrors.confirmPassword = "New password and confirmation do not match";
          } else {
            delete nextErrors.confirmPassword;
          }
        }
        return nextErrors;
      });
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setForm((prev) => ({ ...prev, confirmPassword: value }));
    if (errors.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: !value.trim()
          ? "Confirm password is required"
          : form.newPassword && value !== form.newPassword
          ? "New password and confirmation do not match"
          : undefined,
      }));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const validation = validatePasswordUpdate(form);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});

    updatePassword(
      {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      },
      {
        onSuccess: (data) => {
          if (!data?.success) {
            const message = data?.message || "Failed to update password";
            const lower = message.toLowerCase();
            if (
              lower.includes("current password") ||
              lower.includes("incorrect password") ||
              lower.includes("wrong password") ||
              lower.includes("invalid password")
            ) {
              setErrors({ currentPassword: message });
            }
            return;
          }
          setForm(emptyForm);
          setErrors({});
          setShowCurrent(false);
          setShowNew(false);
          setShowConfirm(false);
        },
        onError: (error) => {
          const message = getApiErrorMessage(
            error,
            "Unable to update password. Please try again."
          );
          const lower = message.toLowerCase();
          if (
            lower.includes("current password") ||
            lower.includes("incorrect password") ||
            lower.includes("wrong password") ||
            lower.includes("invalid password")
          ) {
            setErrors((prev) => ({ ...prev, currentPassword: message }));
          }
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" description="Manage your admin account security." />

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-4" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your admin password regularly to keep the panel secure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
            <div className="grid gap-2">
              <Label htmlFor="current">
                Current Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="current"
                  type={showCurrent ? "text" : "password"}
                  autoComplete="current-password"
                  value={form.currentPassword}
                  onChange={(e) => handleCurrentPasswordChange(e.target.value)}
                  disabled={isPending}
                  aria-invalid={!!errors.currentPassword}
                  className={cn(
                    "pr-10",
                    errors.currentPassword &&
                      "border-destructive focus-visible:ring-destructive"
                  )}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowCurrent((prev) => !prev)}
                  disabled={isPending}
                  aria-label={showCurrent ? "Hide current password" : "Show current password"}
                  className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center pr-3 transition-colors"
                >
                  {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-xs font-medium text-destructive">
                  {errors.currentPassword}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="new">
                New Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="new"
                  type={showNew ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.newPassword}
                  onChange={(e) => handleNewPasswordChange(e.target.value)}
                  disabled={isPending}
                  aria-invalid={!!errors.newPassword}
                  className={cn(
                    "pr-10",
                    errors.newPassword &&
                      "border-destructive focus-visible:ring-destructive"
                  )}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowNew((prev) => !prev)}
                  disabled={isPending}
                  aria-label={showNew ? "Hide new password" : "Show new password"}
                  className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center pr-3 transition-colors"
                >
                  {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.newPassword ? (
                <p className="text-xs font-medium text-destructive">
                  {errors.newPassword}
                </p>
              ) : (
                <p className="text-muted-foreground text-xs">
                  Must be at least 8 characters.
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirm">
                Confirm New Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  disabled={isPending}
                  aria-invalid={!!errors.confirmPassword}
                  className={cn(
                    "pr-10",
                    errors.confirmPassword &&
                      "border-destructive focus-visible:ring-destructive"
                  )}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirm((prev) => !prev)}
                  disabled={isPending}
                  aria-label={showConfirm ? "Hide confirmation password" : "Show confirmation password"}
                  className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center pr-3 transition-colors"
                >
                  {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs font-medium text-destructive">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <Button type="submit" className="w-fit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}