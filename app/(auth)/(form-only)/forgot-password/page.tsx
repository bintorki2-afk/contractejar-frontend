import { redirect } from "next/navigation";

/** Passwords are no longer used on the website (mobile + OTP sign-in). */
export default function PasswordFlowPage() {
  redirect("/login");
}
