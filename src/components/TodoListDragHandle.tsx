import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { ChevronRight, Ellipsis } from "lucide-react";
import { useTodoStore } from "@/hooks/useTodoStore";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

export default function TodoListDragHandle({
  listeners,
  listId,
}: {
  listeners: SyntheticListenerMap | undefined;
  listId: string;
}) {
  const projects = useTodoStore((state) => state.projects);
  const removeList = useTodoStore((state) => state.removeList);
  const moveListToProject = useTodoStore((state) => state.moveListToProject);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [menuCoords, setMenuCoords] = useState<{ left: number; top: number } | null>(
    null,
  );
  const [openSubmenu, setOpenSubmenu] = useState(false);
  const [submenuDirection, setSubmenuDirection] = useState<"left" | "right">(
    "right",
  );
  const [submenuTopOffset, setSubmenuTopOffset] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);

  const sortedProjects = useMemo(
    () => [...projects].sort((a, b) => a.position - b.position),
    [projects],
  );

  useEffect(() => {
    function handleClose() {
      setMenuPos(null);
      setMenuCoords(null);
      setOpenSubmenu(false);
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      handleClose();
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

  useLayoutEffect(() => {
    if (!openSubmenu || !menuRef.current || !submenuRef.current) return;
    const gap = 8;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const menuRect = menuRef.current.getBoundingClientRect();
    const submenuWidth = submenuRef.current.offsetWidth;
    const submenuHeight = submenuRef.current.offsetHeight;

    const shouldOpenLeft =
      menuRect.right + 4 + submenuWidth > viewportWidth - gap;
    setSubmenuDirection(shouldOpenLeft ? "left" : "right");

    let topOffset = 0;
    if (menuRect.top + submenuHeight > viewportHeight - gap) {
      topOffset = viewportHeight - gap - menuRect.top - submenuHeight;
    }
    if (menuRect.top + topOffset < gap) {
      topOffset = gap - menuRect.top;
    }
    setSubmenuTopOffset(topOffset);
  }, [openSubmenu, menuCoords]);

  const closeMenu = () => {
    setMenuPos(null);
    setMenuCoords(null);
    setOpenSubmenu(false);
  };

  return (
    <>
      <button
        className="text-lg hover:bg-neutral-100 rounded-sm p-0.5 cursor-pointer transition-all duration-200 w-10 hover:cursor-move"
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setMenuPos({ x: e.clientX, y: e.clientY });
          setOpenSubmenu(false);
        }}
        {...listeners}
      >
        <Ellipsis className="mx-auto text-neutral-500" />
      </button>

      {menuPos && (
        <div
          ref={menuRef}
          className="fixed z-50 min-w-44 rounded-md border border-neutral-200 bg-white p-1 shadow-lg font-mono"
          style={menuCoords ?? { left: menuPos.x, top: menuPos.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full rounded-sm px-2 py-1 text-left text-sm text-red-600 hover:bg-red-50"
            onClick={() => {
              removeList(listId);
              closeMenu();
            }}
          >
            Delete
          </button>

          <div
            className="relative"
            onMouseEnter={() => setOpenSubmenu(true)}
            onMouseLeave={() => setOpenSubmenu(false)}
          >
            <button className="flex w-full items-center justify-between rounded-sm px-2 py-1 text-left text-sm hover:bg-neutral-100">
              <span>Move to project</span>
              <ChevronRight size={14} />
            </button>

            {openSubmenu && (
              <div
                ref={submenuRef}
                className="absolute min-w-40 rounded-md border border-neutral-200 bg-white p-1 shadow-lg"
                style={{
                  top: submenuTopOffset,
                  left: submenuDirection === "right" ? "calc(100% + 4px)" : undefined,
                  right: submenuDirection === "left" ? "calc(100% + 4px)" : undefined,
                }}
              >
                {sortedProjects.map((project) => (
                  <button
                    key={project.id}
                    className="w-full rounded-sm px-2 py-1 text-left text-sm hover:bg-neutral-100"
                    onClick={() => {
                      moveListToProject({ listId, projectId: project.id });
                      closeMenu();
                    }}
                  >
                    {project.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
