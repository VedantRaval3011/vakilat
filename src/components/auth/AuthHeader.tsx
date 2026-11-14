export function AuthHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-8 text-center">
      <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
      <p className="mt-3 text-muted">{subtitle}</p>
    </div>
  );
}
