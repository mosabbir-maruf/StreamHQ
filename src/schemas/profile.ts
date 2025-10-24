import { z } from "zod";

// Profile update schema
export const ProfileUpdateSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required"),
  avatar: z.string().optional(),
  bio: z
    .string()
    .max(150, "Bio must be less than 150 characters")
    .optional(),
  social_link: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  isPublic: z.boolean().optional(),
});

// Password update schema
export const PasswordUpdateSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be less than 100 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Email update schema
export const EmailUpdateSchema = z.object({
  newEmail: z.string().email("Invalid email address"),
  currentPassword: z.string().min(1, "Current password is required"),
});

export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;
export type PasswordUpdateInput = z.infer<typeof PasswordUpdateSchema>;
export type EmailUpdateInput = z.infer<typeof EmailUpdateSchema>;
