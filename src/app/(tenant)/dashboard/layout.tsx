import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardSidebar } from "@/components/tenant/dashboard-sidebar";
import { DashboardHeader } from "@/components/tenant/dashboard-header";
import { DemoBanner } from "@/components/tenant/demo-banner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset>
          <DemoBanner />
          <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-6">
            <SidebarTrigger className="-ml-2" />
            <Separator orientation="vertical" className="mr-2 !h-4" />
            <DashboardHeader />
          </header>
          <main className="flex-1 overflow-auto bg-muted/30 p-8">
            <div className="mx-auto max-w-6xl">{children}</div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
