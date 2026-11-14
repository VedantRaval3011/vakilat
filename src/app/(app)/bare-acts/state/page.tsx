import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/app/ModulePlaceholder";

export const metadata: Metadata = { title: "State Acts | Vakilat" };

export default function Page() {
  return <ModulePlaceholder moduleKey="state-acts" />;
}
