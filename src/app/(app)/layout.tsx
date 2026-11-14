import { Suspense } from "react";
import { AppShell } from "@/components/app/AppShell";
import { UserMenu } from "@/components/app/UserMenu";
import { getCurrentUser } from "@/lib/auth/current-user";

async function UserSlot() {
  const user = await getCurrentUser();
  return <UserMenu name={user.name} email={user.email} profession={user.profession} photo={user.photo} />;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      userMenu={
        <Suspense fallback={<div className="size-11 animate-pulse rounded-full bg-surface-2" />}>
          <UserSlot />
        </Suspense>
      }
    >
      {children}
    </AppShell>
  );
}
