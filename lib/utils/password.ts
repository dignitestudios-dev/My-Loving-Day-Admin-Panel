// Matches Unicode emojis, pictographs, and emoji presentation sequences
export const EMOJI_REGEX =
  /\p{Extended_Pictographic}|\p{Emoji_Presentation}/u;

/**
 * Checks if a string contains any emoji or pictographic characters.
 */
export function containsEmoji(value: string): boolean {
  return EMOJI_REGEX.test(value);
}

/**
 * Validates a password input for disallowed/unsupported characters (such as emojis).
 */
export function validatePassword(
  password: string,
  options?: { fieldName?: string; minLength?: number }
): {
  isValid: boolean;
  error: string | null;
} {
  const fieldName = options?.fieldName || "Password";
  const minLength = options?.minLength ?? 0;

  if (!password || !password.trim()) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  if (containsEmoji(password)) {
    return {
      isValid: false,
      error: `${fieldName} cannot contain emojis or unsupported characters`,
    };
  }

  if (minLength > 0 && password.length < minLength) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${minLength} characters`,
    };
  }

  return { isValid: true, error: null };
}

export interface PasswordUpdateFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordUpdateErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

/**
 * Validates all fields for the update password form.
 * Ensures:
 * - Current password is provided and does not contain emojis/unsupported characters.
 * - New password is provided, is at least 8 characters, has no emojis, and is different from current password.
 * - Confirm password is provided and matches the new password.
 */
export function validatePasswordUpdate(form: PasswordUpdateFormState): {
  isValid: boolean;
  errors: PasswordUpdateErrors;
} {
  const errors: PasswordUpdateErrors = {};

  // 1. Current Password Validation
  if (!form.currentPassword || !form.currentPassword.trim()) {
    errors.currentPassword = "Current password is required";
  } else if (containsEmoji(form.currentPassword)) {
    errors.currentPassword =
      "Current password cannot contain emojis or unsupported characters";
  }

  // 2. New Password Validation
  if (!form.newPassword || !form.newPassword.trim()) {
    errors.newPassword = "New password is required";
  } else if (form.newPassword.length < 8) {
    errors.newPassword = "New password must be at least 8 characters";
  } else if (containsEmoji(form.newPassword)) {
    errors.newPassword =
      "New password cannot contain emojis or unsupported characters";
  } else if (
    form.currentPassword &&
    form.newPassword === form.currentPassword
  ) {
    errors.newPassword =
      "New password must be different from the current password";
  }

  // 3. Confirm Password Validation
  if (!form.confirmPassword || !form.confirmPassword.trim()) {
    errors.confirmPassword = "Confirm password is required";
  } else if (form.newPassword && form.confirmPassword !== form.newPassword) {
    errors.confirmPassword = "New password and confirmation do not match";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

