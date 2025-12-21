import Sidebar from "@/components/Sidebar";
import { ReactNode } from "react";
import Script from "next/script";
import Footer from "@/components/Footer";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/dist/face-api.min.js"
        strategy="beforeInteractive"
      />
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 lg:ml-64 flex flex-col pb-20 lg:pb-0">
          <main className="flex-1">{children}</main>
          <div className="hidden lg:block">
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
}