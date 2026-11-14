import { Tour } from "@/components/app/Tour";
import { getCurrentUser } from "@/lib/auth/current-user";
import type { TourKey } from "@/lib/tours/catalog";
import { isTourDismissed } from "@/lib/tours/queries";

export async function TourGate({ tourKey }: { tourKey: TourKey }) {
  const user = await getCurrentUser();
  if (isTourDismissed(user.id, tourKey)) return null;
  return <Tour tourKey={tourKey} />;
}
