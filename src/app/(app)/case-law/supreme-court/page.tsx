import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/app/ModulePlaceholder";

export const metadata: Metadata = { title: "Supreme Court | Vakilat" };

export default function Page() {
  return <ModulePlaceholder moduleKey="supreme-court" />;
}
