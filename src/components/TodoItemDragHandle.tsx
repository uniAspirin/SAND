import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { EllipsisVertical } from "lucide-react";
import { useTodoStore } from "@/hooks/useTodoStore";
import { useEffect, useState } from "react";

export default function TodoItemDragHandle({
  listeners,
  itemId,
  isUrgent,
}: {
  listeners: SyntheticListenerMap | undefined;
  itemId: string;
  isUrgent: boolean;
}) {
  const removeItem = useTodoStore((state) => state.removeItem);
  const toggleItemUrgent = useTodoStore((state) => state.toggleItemUrgent);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    function handleClose() {
      setMenuPos(null);
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      setMenuPos(null);
    }

    window.addEventListener("click", handleClose);
    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("click", handleClose);
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <>
      <button
        className="hover:bg-neutral-100 rounded-sm cursor-pointer transition-all duration-200 hover:cursor-move"
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setMenuPos({ x: e.clientX, y: e.clientY });
        }}
        {...listeners}
      >
        <EllipsisVertical className="mx-auto text-neutral-200" />
      </button>

      {menuPos && (
        <div
          className="fixed z-50 min-w-36 rounded-md border border-neutral-200 bg-white p-1 shadow-lg"
          style={{
            left: menuPos.x,
            top: menuPos.y - 8,
            transform: "translateY(-100%)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full rounded-sm px-2 py-1 text-left text-sm hover:bg-neutral-100 font-mono"
            onClick={() => {
              toggleItemUrgent(itemId);
              setMenuPos(null);
            }}
          >
            {isUrgent ? "Unmark urgent" : "Mark as urgent"}
          </button>
          <button
            className="w-full rounded-sm px-2 py-1 text-left text-sm text-red-600 hover:bg-red-50 font-mono"
            onClick={() => {
              removeItem(itemId);
              setMenuPos(null);
            }}
          >
            Delete
          </button>
        </div>
      )}
    </>
  );
}
