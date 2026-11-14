"use server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { tours, type TourKey } from "@/lib/tours/catalog";
import { dismissTour } from "@/lib/tours/queries";

export async function dismissUserTour(tourKey: TourKey) {
  if (!(tourKey in tours)) return;
  const user = await getCurrentUser();
  dismissTour(user.id, tourKey);
}
