import { z } from "zod";

export const FONT_OPTIONS = [
  { label: "Inter", value: "Inter" },
  { label: "Poppins", value: "Poppins" },
  { label: "Lato", value: "Lato" },
  { label: "Montserrat", value: "Montserrat" },
] as const;

export const brandConfigSchema = z.object({
  company_name: z
    .string()
    .min(1, "Company name is required")
    .max(100, "Company name must be 100 characters or less"),
  logo_url: z.string().optional(),
  primary_colour: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex colour (e.g. #4F46E5)"),
  secondary_colour: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex colour (e.g. #10B981)"),
  font: z.enum(["Inter", "Poppins", "Lato", "Montserrat"]),
  support_email: z
    .string()
    .email("Must be a valid email address")
    .or(z.literal("")),
});

export type BrandConfig = z.infer<typeof brandConfigSchema>;

export const DEFAULT_BRAND_CONFIG: BrandConfig = {
  company_name: "",
  logo_url: "",
  primary_colour: "#4F46E5",
  secondary_colour: "#10B981",
  font: "Inter",
  support_email: "",
};
