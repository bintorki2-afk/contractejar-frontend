import { z } from "zod";

type ForgotPasswordSchemaMessages = {
  emailRequired: string;
  emailInvalid: string;
};

export function createForgotPasswordSchema(
  messages: ForgotPasswordSchemaMessages
) {
  return z.object({
    email: z
      .string()
      .min(1, messages.emailRequired)
      .email(messages.emailInvalid),
  });
}

export type ForgotPasswordFormValues = z.infer<
  ReturnType<typeof createForgotPasswordSchema>
>;
