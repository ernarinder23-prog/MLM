export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Child layouts will handle authentication
  // This layout just wraps everything under /admin/*
  return <>{children}</>;
}
