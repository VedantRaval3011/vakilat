import { Showcase } from "@/components/auth/Showcase";
import { Navbar } from "@/components/site/Navbar";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Navbar showTicker={false} />
      <main className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <Showcase />
        <div className="flex justify-center px-5 py-12 md:py-16">
          <div className="w-full max-w-lg">{children}</div>
        </div>
      </main>
    </>
  );
}
