"use client";

import { useState, useEffect } from "react";
import { BinaryTreeGraph } from "@/components/BinaryTreeGraph";

export default function BinaryTreePage() {
  const [rootId, setRootId] = useState<string>("");
  const [users, setUsers] = useState<{ id: string; username: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users/list")
      .then((r) => r.json())
      .then((data) => {
        if (data.users) setUsers(data.users);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-heading font-bold text-primary mb-6">
        Binary Tree
      </h1>
      <div className="mb-6 flex gap-4 items-center">
        <label className="text-sm font-medium">Root user:</label>
        <select
          value={rootId}
          onChange={(e) => setRootId(e.target.value)}
          className="input w-48"
        >
          <option value="">Select root</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.username}</option>
          ))}
        </select>
      </div>
      <div className="card min-h-[600px] bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-96">Loading...</div>
        ) : rootId ? (
          <BinaryTreeGraph rootId={rootId} />
        ) : (
          <div className="flex items-center justify-center h-96 text-text-secondary">
            Select a root user to view the binary tree
          </div>
        )}
      </div>
    </div>
  );
}
