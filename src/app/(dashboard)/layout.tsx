import { V40Layout } from '@/components/layout/v40-layout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <V40Layout>{children}</V40Layout>;
}
