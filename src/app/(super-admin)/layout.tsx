import { AdminSidebar } from "@/components/super-admin/admin-sidebar";
import { requireSuperAdmin } from "./auth";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { adminEmail } = await requireSuperAdmin();

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar adminEmail={adminEmail} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
