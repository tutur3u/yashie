import type { ReactNode } from "react";
import { YashieAdminShell } from "@/components/admin/YashieAdminShell";
import { buildYashieTasksUrl } from "@/lib/yashie-config";

export default function AdminSectionLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <YashieAdminShell tasksHref={buildYashieTasksUrl()}>
      {children}
    </YashieAdminShell>
  );
}
