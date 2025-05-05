// app/game/layout.tsx
import Sidebar from "@/app/components/sidebar";

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
