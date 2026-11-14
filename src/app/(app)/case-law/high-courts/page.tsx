import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/app/ModulePlaceholder";

export const metadata: Metadata = { title: "High Courts | Vakilat" };

export default function Page() {
  return <ModulePlaceholder moduleKey="high-courts" />;
}
