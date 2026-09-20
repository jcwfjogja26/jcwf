"use client";

import { ReactNode } from "react";

import AdminSidebar from "./AdminSidebar";

export default function AdminShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F7F3E8] text-[#17382A]">
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <AdminSidebar />

        {/* MAIN */}
        <div className="min-w-0 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}