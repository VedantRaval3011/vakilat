import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/app/ModulePlaceholder";

export const metadata: Metadata = { title: "Central Acts | Vakilat" };

export default function Page() {
  return <ModulePlaceholder moduleKey="central-acts" />;
}
