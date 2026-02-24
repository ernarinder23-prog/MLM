"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface DeleteButtonProps {
  id: string;
  apiEndpoint: string;
  onSuccess?: () => void;
  confirmMessage?: string;
  /** Redirect to this path after successful delete (e.g. list page) */
  redirectTo?: string;
}

export function DeleteButton({ id, apiEndpoint, onSuccess, confirmMessage, redirectTo }: DeleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleDelete() {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiEndpoint}/${id}`, {
        method: "DELETE",
      });
      
      let data;
      try {
        data = await res.json();
      } catch {
        const text = await res.text();
        alert(`Delete failed: ${res.status} ${res.statusText}. ${text || "Unknown error"}`);
        setShowConfirm(false);
        setLoading(false);
        return;
      }
      
      if (!res.ok) {
        alert(data.error || `Failed to delete: ${res.status} ${res.statusText}`);
        setShowConfirm(false);
        setLoading(false);
        return;
      }
      
      setShowConfirm(false);
      onSuccess?.();
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert(`Connection error: ${error instanceof Error ? error.message : "Unknown error"}. Please check the browser console (F12).`);
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  }

  if (showConfirm) {
    return (
      <div className="flex gap-2 items-center">
        <span className="text-xs text-text-secondary">Confirm?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-3 py-1 rounded bg-error/10 text-error text-sm hover:bg-error/20 disabled:opacity-50"
        >
          {loading ? "Deleting..." : "Yes"}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={loading}
          className="px-3 py-1 rounded bg-gray-100 text-text-secondary text-sm hover:bg-gray-200 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-error hover:text-error/80 text-sm flex items-center gap-1 disabled:opacity-50"
      title={confirmMessage || "Delete"}
    >
      <Trash2 className="w-4 h-4" />
      Delete
    </button>
  );
}
