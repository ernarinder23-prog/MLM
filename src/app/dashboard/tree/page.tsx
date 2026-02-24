"use client";

import { useState, useEffect } from "react";
import { BinaryTreeGraph } from "@/components/BinaryTreeGraph";

export default function DashboardTreePage() {
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user?.id) setUserId(data.user.id);
      });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-heading font-bold text-primary mb-6">
        Binary Tree
      </h1>
      <div className="card min-h-[600px] bg-gray-50">
        {userId ? (
          <BinaryTreeGraph rootId={userId} />
        ) : (
          <div className="flex items-center justify-center h-96">Loading...</div>
        )}
      </div>
    </div>
  );
}
