"use client";

import Footer from "@/app/components/footers/footer";
import Sidebar from "@/app/components/sidebar";

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* On mobile, the sidebar should be above the main content. On larger screens, sidebar on the left */}
      <div className="flex-1 flex flex-col lg:flex-row">
        <Sidebar />
        <main className="flex-1 flex flex-col justify-between">{children}</main>
      </div>
      {/* Footer at the bottom of the screen */}
      <Footer />
    </div>
  );
}
