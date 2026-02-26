import { AppLayout } from "@/components/shared/app-layout";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
