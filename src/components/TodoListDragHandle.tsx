import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { ChevronRight, Ellipsis } from "lucide-react";
import { useTodoStore } from "@/hooks/useTodoStore";
import { useEffect, useMemo, useState } from "react";

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
  const [openSubmenu, setOpenSubmenu] = useState(false);

  const sortedProjects = useMemo(
    () => [...projects].sort((a, b) => a.position - b.position),
    [projects],
  );

  useEffect(() => {
    function handleClose() {
      setMenuPos(null);
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

  const closeMenu = () => {
    setMenuPos(null);
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
          className="fixed z-50 min-w-44 rounded-md border border-neutral-200 bg-white p-1 shadow-lg font-mono"
          style={{
            left: menuPos.x,
            top: menuPos.y - 8,
            transform: "translateY(-100%)",
          }}
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
              <div className="absolute left-full top-0 ml-1 min-w-40 rounded-md border border-neutral-200 bg-white p-1 shadow-lg">
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
