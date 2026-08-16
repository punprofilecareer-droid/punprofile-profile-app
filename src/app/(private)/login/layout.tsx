import type { Metadata } from "next";
import { NOT_INDEXED } from "@/lib/seo";

/** Never indexed, same reasoning as `admin/layout.tsx`. */
export const metadata: Metadata = NOT_INDEXED;

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
