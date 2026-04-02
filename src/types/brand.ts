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

// ─── Page Builder types ─────────────────────────────────────

export type SectionType = "testimonials" | "faq" | "features";

export interface FaqItem {
  question: string;
  answer: string;
}

export interface TestimonialItem {
  name: string;
  quote: string;
  rating: number; // 1-5
}

export interface FeatureItem {
  icon: string; // lucide icon name
  title: string;
  description: string;
}

export interface PageSection {
  id: string;
  type: SectionType;
  enabled: boolean;
  order: number;
  content: {
    items: FaqItem[] | TestimonialItem[] | FeatureItem[];
  };
}

export interface PageConfig {
  theme: "light" | "dark";
  hero_headline: string;
  hero_subheadline: string;
  hero_image_url: string;
  hero_bg_video_url: string;
  hero_cta_primary_text: string;
  hero_cta_secondary_text: string;
  products_label: string;
  products_heading: string;
  products_description: string;
  about_text: string;
  sections: PageSection[];
}

export const DEFAULT_PAGE_CONFIG: PageConfig = {
  theme: "light",
  hero_headline: "",
  hero_subheadline: "",
  hero_image_url: "",
  hero_bg_video_url: "",
  hero_cta_primary_text: "View our products",
  hero_cta_secondary_text: "Manage my policy",
  products_label: "",
  products_heading: "",
  products_description: "",
  about_text: "",
  sections: [
    {
      id: "testimonials",
      type: "testimonials",
      enabled: false,
      order: 0,
      content: {
        items: [
          { name: "Sarah Johnson", quote: "The best insurance experience I've ever had. Quick, simple, and transparent.", rating: 5 },
          { name: "James Wilson", quote: "Excellent customer service and competitive prices. Highly recommend.", rating: 5 },
          { name: "Emily Brown", quote: "Made switching insurance providers completely painless.", rating: 4 },
        ] as TestimonialItem[],
      },
    },
    {
      id: "faq",
      type: "faq",
      enabled: false,
      order: 1,
      content: {
        items: [
          { question: "How do I make a claim?", answer: "You can make a claim through your online portal or by contacting our support team. We aim to process all claims within 48 hours." },
          { question: "Can I cancel my policy?", answer: "Yes, you can cancel your policy at any time. Any unused premium will be refunded on a pro-rata basis." },
          { question: "How long does it take to get a quote?", answer: "Our online quoting process takes less than 5 minutes. You'll receive your personalised quote instantly." },
        ] as FaqItem[],
      },
    },
    {
      id: "features",
      type: "features",
      enabled: false,
      order: 2,
      content: {
        items: [
          { icon: "Shield", title: "Comprehensive Cover", description: "Full protection for what matters most to you." },
          { icon: "Clock", title: "Quick Claims", description: "We process 90% of claims within 48 hours." },
          { icon: "HeadphonesIcon", title: "24/7 Support", description: "Our team is always available to help you." },
        ] as FeatureItem[],
      },
    },
  ],
};
