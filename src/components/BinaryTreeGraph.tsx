"use client";

import { useState, useEffect, useCallback } from "react";

interface TreeNode {
  id: string;
  username: string;
  packageName?: string;
  investmentAmount?: number | null;
  businessVolume?: number | null;
  joiningDate?: string;
  left?: TreeNode | null;
  right?: TreeNode | null;
}

interface BinaryTreeGraphProps {
  rootId: string;
  refetchKey?: number;
}

export function BinaryTreeGraph({ rootId, refetchKey = 0 }: BinaryTreeGraphProps) {
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selected, setSelected] = useState<TreeNode | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTree = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tree?rootId=${rootId}`);
      const data = await res.json();
      setTree(data.node || null);
    } catch {
      setTree(null);
    } finally {
      setLoading(false);
    }
  }, [rootId]);

  useEffect(() => {
    fetchTree();
  }, [fetchTree, refetchKey]);

  if (loading || !tree) {
    return (
      <div className="flex items-center justify-center h-96">
        {loading ? "Loading tree..." : "No data"}
      </div>
    );
  }

  const NODE_WIDTH = 120;
  const NODE_HEIGHT = 60;
  const H_GAP = 40;
  const V_GAP = 80;

  function getLayout(node: TreeNode, depth: number, pos: number): { node: TreeNode; x: number; y: number }[] {
    const result: { node: TreeNode; x: number; y: number }[] = [];
    const x = pos * (NODE_WIDTH + H_GAP);
    const y = depth * (NODE_HEIGHT + V_GAP);
    result.push({ node, x, y });

    if (node.left) {
      const leftSpan = node.right ? 1 : 0.5;
      result.push(
        ...getLayout(node.left, depth + 1, pos - leftSpan).map((r) => ({
          ...r,
          node: r.node,
          x: r.x,
          y: r.y,
        }))
      );
    }
    if (node.right) {
      const rightSpan = node.left ? 1 : 0.5;
      result.push(
        ...getLayout(node.right, depth + 1, pos + rightSpan).map((r) => ({
          ...r,
          node: r.node,
          x: r.x,
          y: r.y,
        }))
      );
    }
    return result;
  }

  const layout = getLayout(tree, 0, 0);
  const minX = Math.min(...layout.map((l) => l.x));
  const maxX = Math.max(...layout.map((l) => l.x));
  const width = maxX - minX + NODE_WIDTH + H_GAP * 2;
  const height = Math.max(...layout.map((l) => l.y)) + NODE_HEIGHT + V_GAP;

  const offsetX = -minX + H_GAP;
  const offsetY = V_GAP;

  const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  layout.forEach(({ node, x, y }) => {
    const cx = x + offsetX + NODE_WIDTH / 2;
    const cy = y + offsetY + NODE_HEIGHT / 2;
    if (node.left) {
      const left = layout.find((l) => l.node.id === node.left!.id);
      if (left) {
        const lx = left.x + offsetX + NODE_WIDTH / 2;
        const ly = left.y + offsetY;
        lines.push({ x1: cx, y1: cy, x2: lx, y2: ly });
      }
    }
    if (node.right) {
      const right = layout.find((l) => l.node.id === node.right!.id);
      if (right) {
        const rx = right.x + offsetX + NODE_WIDTH / 2;
        const ry = right.y + offsetY;
        lines.push({ x1: cx, y1: cy, x2: rx, y2: ry });
      }
    }
  });

  return (
    <div className="relative overflow-auto" style={{ minHeight: 500 }}>
      <div
        className="inline-block min-w-full"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
        }}
      >
        <svg width={width} height={height} className="block">
          {lines.map((line, i) => (
            <line
              key={i}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="#0F2A44"
              strokeWidth="1"
              opacity={0.3}
            />
          ))}
          {layout.map(({ node, x, y }) => (
            <g key={node.id}>
              <rect
                x={x + offsetX}
                y={y + offsetY}
                width={NODE_WIDTH}
                height={NODE_HEIGHT}
                rx={8}
                fill={selected?.id === node.id ? "#1DB954" : "#FFFFFF"}
                stroke={selected?.id === node.id ? "#1DB954" : "#0F2A44"}
                strokeWidth={2}
                className="cursor-pointer"
                onMouseEnter={() => setSelected(node)}
                onMouseLeave={() => setSelected(null)}
              />
              <text
                x={x + offsetX + NODE_WIDTH / 2}
                y={y + offsetY + NODE_HEIGHT / 2 - 8}
                textAnchor="middle"
                fill={selected?.id === node.id ? "#FFF" : "#1E1E1E"}
                fontSize={12}
                fontWeight={600}
              >
                {node.username}
              </text>
              <text
                x={x + offsetX + NODE_WIDTH / 2}
                y={y + offsetY + NODE_HEIGHT / 2 + 8}
                textAnchor="middle"
                fill={selected?.id === node.id ? "rgba(255,255,255,0.9)" : "#6B7280"}
                fontSize={10}
              >
                {node.packageName || "-"} {node.investmentAmount != null ? `₹${node.investmentAmount}` : ""}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => setZoom((z) => Math.min(2, z + 0.2))}
          className="px-3 py-1 bg-white rounded shadow text-sm"
        >
          +
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))}
          className="px-3 py-1 bg-white rounded shadow text-sm"
        >
          −
        </button>
      </div>
      {selected && (
        <div className="absolute top-4 right-4 card w-72 shadow-lg z-10">
          <h4 className="font-semibold text-primary">{selected.username}</h4>
          <p className="text-sm text-text-secondary">ID: {selected.id}</p>
          <p className="text-sm text-text-secondary">Package: {selected.packageName || "-"}</p>
          {selected.investmentAmount != null && selected.investmentAmount > 0 && (
            <p className="text-sm text-text-secondary">Investment: ₹{selected.investmentAmount.toFixed(2)}</p>
          )}
          {selected.businessVolume != null && selected.businessVolume > 0 && (
            <p className="text-sm text-text-secondary">Business Volume: {selected.businessVolume}</p>
          )}
          {selected.joiningDate && (
            <p className="text-sm text-text-secondary">Joined: {new Date(selected.joiningDate).toLocaleDateString()}</p>
          )}
        </div>
      )}
    </div>
  );
}
