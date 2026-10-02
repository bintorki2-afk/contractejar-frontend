import { z } from "zod";

type RegisterSchemaMessages = {
  fullNameRequired: string;
  fullNameMin: string;
  emailRequired: string;
  emailInvalid: string;
  passwordRequired: string;
  passwordMin: string;
  termsRequired: string;
};

export function createRegisterSchema(messages: RegisterSchemaMessages) {
  return z.object({
    fullName: z
      .string()
      .min(1, messages.fullNameRequired)
      .min(3, messages.fullNameMin),
    email: z
      .string()
      .min(1, messages.emailRequired)
      .email(messages.emailInvalid),
    password: z
      .string()
      .min(1, messages.passwordRequired)
      .min(8, messages.passwordMin),
    acceptTerms: z
      .boolean()
      .refine((value) => value === true, messages.termsRequired),
  });
}

export type RegisterFormValues = z.infer<
  ReturnType<typeof createRegisterSchema>
>;
