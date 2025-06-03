"use client";

import { ReactNode } from "react";
import { useParams } from "next/navigation";
import usePresenceAndCleanup from "@/lib/hooks/usePresenceAndCleanup";
import Sidebar from "@/app/components/sidebar";
import Footer from "@/app/components/footers/footer";

export default function GameLayout({ children }: { children: ReactNode }) {
  const { roomId } = useParams();
  usePresenceAndCleanup(roomId); // Activate presence/cleanup logic

  return (
    <div className="flex flex-col min-h-screen w-full">
      <div className="flex-1 flex flex-col lg:flex-row">
        <Sidebar />
        <main className="flex-1 flex flex-col justify-between">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
