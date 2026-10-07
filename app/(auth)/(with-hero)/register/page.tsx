import { redirect } from "next/navigation";

/** Registration is implicit now (mobile + OTP creates the account). */
export default function RegisterPage() {
  redirect("/login");
}
