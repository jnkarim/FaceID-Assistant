import Sidebar from "@/components/Sidebar";
import { ReactNode } from "react";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64">{children}</main>
    </div>
  );
}
