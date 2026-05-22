/**
 * lib/changePassword.ts
 * Safely changes a Firebase Auth user's password.
 * Requires reauthentication first (Firebase security requirement).
 */

import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export type PasswordChangeResult =
  | { ok: true }
  | { ok: false; code: string; message: string };

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<PasswordChangeResult> {
  const user = auth.currentUser;
  if (!user || !user.email) {
    return { ok: false, code: "no-user", message: "Not logged in." };
  }

  if (newPassword.length < 8) {
    return {
      ok: false,
      code: "weak-password",
      message: "New password must be at least 8 characters.",
    };
  }

  try {
    // Firebase requires fresh credentials before sensitive operations
    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword,
    );
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
    return { ok: true };
  } catch (err: unknown) {
    const code = (err as { code?: string }).code ?? "unknown";
    const messages: Record<string, string> = {
      "auth/wrong-password": "Current password is incorrect.",
      "auth/too-many-requests": "Too many attempts. Try again later.",
      "auth/weak-password": "New password is too weak.",
      "auth/requires-recent-login":
        "Session expired. Please log out and log in again.",
    };
    return {
      ok: false,
      code,
      message: messages[code] ?? "Password change failed. Please try again.",
    };
  }
}
