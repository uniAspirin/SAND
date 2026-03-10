import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { EllipsisVertical } from "lucide-react";
import { useTodoStore } from "@/hooks/useTodoStore";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

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
  const [menuCoords, setMenuCoords] = useState<{ left: number; top: number } | null>(
    null,
  );
  const menuRef = useRef<HTMLDivElement>(null);

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

  useLayoutEffect(() => {
    if (!menuPos || !menuRef.current) return;
    const gap = 8;
    const menuWidth = menuRef.current.offsetWidth;
    const menuHeight = menuRef.current.offsetHeight;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = menuPos.x;
    if (left + menuWidth > viewportWidth - gap) {
      left = viewportWidth - menuWidth - gap;
    }
    if (left < gap) left = gap;

    let top = menuPos.y - gap - menuHeight;
    if (top < gap) {
      top = menuPos.y + gap;
    }
    if (top + menuHeight > viewportHeight - gap) {
      top = viewportHeight - menuHeight - gap;
    }
    if (top < gap) top = gap;

    setMenuCoords({ left, top });
  }, [menuPos]);

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
          ref={menuRef}
          className="fixed z-50 min-w-36 rounded-md border border-neutral-200 bg-white p-1 shadow-lg text-xs"
          style={menuCoords ?? { left: menuPos.x, top: menuPos.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className={`w-full rounded-sm px-2 py-1 text-left font-mono ${!isUrgent ? " text-yellow-500 hover:bg-yellow-100" : "hover:bg-neutral-100"}`}
            onClick={() => {
              toggleItemUrgent(itemId);
              setMenuPos(null);
            }}
          >
            {isUrgent ? "Unmark urgent" : "Mark as urgent"}
          </button>
          <button
            className="w-full rounded-sm px-2 py-1 text-left text-red-600 hover:bg-red-50 font-mono"
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
