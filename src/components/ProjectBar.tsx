import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useTodoStore } from "@/hooks/useTodoStore";

export default function ProjectBar() {
  const projects = useTodoStore((state) => state.projects);
  const activeProjectId = useTodoStore((state) => state.activeProjectId);
  const setActiveProjectId = useTodoStore((state) => state.setActiveProjectId);
  const addProject = useTodoStore((state) => state.addProject);
  const editProjectName = useTodoStore((state) => state.editProjectName);
  const removeProject = useTodoStore((state) => state.removeProject);
  const [projectName, setProjectName] = useState("");
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingProjectName, setEditingProjectName] = useState("");
  const [menuState, setMenuState] = useState<{
    projectId: string;
    x: number;
    y: number;
  } | null>(null);

  const sortedProjects = [...projects].sort((a, b) => a.position - b.position);

  useEffect(() => {
    function handleCloseMenu() {
      setMenuState(null);
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuState(null);
    }

    window.addEventListener("click", handleCloseMenu);
    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("click", handleCloseMenu);
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);

  function handleCreateProject() {
    const nextName = projectName.trim();
    if (!nextName) return;
    addProject(nextName);
    setProjectName("");
  }

  function handleRenameProject(projectId: string) {
    const target = projects.find((project) => project.id === projectId);
    if (!target || target.isSystem) return;
    setEditingProjectId(projectId);
    setEditingProjectName(target.name);
  }

  function commitProjectRename() {
    if (!editingProjectId) return;
    const nextName = editingProjectName.trim();
    if (nextName) {
      editProjectName({ projectId: editingProjectId, name: nextName });
    }
    setEditingProjectId(null);
    setEditingProjectName("");
  }

  return (
    <div className="border-t bg-white px-3 py-2 md:px-8 font-mono text-xs sm:text-base flex justify-between">
      <div className="flex items-center gap-2 overflow-x-auto">
        {sortedProjects.map((project) => {
          const isActive = activeProjectId === project.id;
          const baseStyle =
            "flex items-center gap-2 rounded-md px-3 py-1.5 transition-all duration-200 cursor-pointer font-semibold";
          const activeStyle = isActive
            ? "bg-yellow-400 text-white"
            : "bg-white";

          if (project.isSystem) {
            return (
              <button
                key={project.id}
                className={`${baseStyle} ${activeStyle}`}
                onClick={() => setActiveProjectId(project.id)}
              >
                {project.name}
              </button>
            );
          }

          return (
            <div
              key={project.id}
              className={`${baseStyle} ${activeStyle}`}
              onClick={() => setActiveProjectId(project.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                setMenuState({
                  projectId: project.id,
                  x: e.clientX,
                  y: e.clientY,
                });
              }}
            >
              {editingProjectId === project.id ? (
                <input
                  autoFocus
                  className={`w-20 bg-transparent outline-none ${isActive ? "text-white" : "text-neutral-700"}`}
                  value={editingProjectName}
                  onChange={(e) => setEditingProjectName(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onBlur={commitProjectRename}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitProjectRename();
                    if (e.key === "Escape") {
                      setEditingProjectId(null);
                      setEditingProjectName("");
                    }
                  }}
                />
              ) : (
                <p className="bg-transparent outline-none">{project.name}</p>
              )}
            </div>
          );
        })}
      </div>
      <div className="ml-auto flex items-center rounded-md shrink-0">
        <input
          className="w-20 p-1.5 pl-3 rounded outline-none text-neutral-500 text-xs sm:text-sm focus:bg-neutral-100 focus:w-50 transition-all duration-150"
          placeholder="New Project"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter" || !projectName.trim()) return;
            handleCreateProject();
          }}
        />
        <button
          className="rounded p-0.5 hover:bg-neutral-100"
          onClick={handleCreateProject}
          title="Add project"
        >
          <Plus size={24} />
        </button>
      </div>

      {menuState && (
        <div
          className="fixed z-50 min-w-36 rounded-md border border-neutral-200 bg-white p-1 shadow-lg"
          style={{
            left: menuState.x,
            top: menuState.y - 8,
            transform: "translateY(-100%)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full rounded-sm px-2 py-1 text-left text-xs hover:bg-neutral-100"
            onClick={() => {
              handleRenameProject(menuState.projectId);
              setMenuState(null);
            }}
          >
            Rename
          </button>
          <button
            className="w-full rounded-sm px-2 py-1 text-left text-xs text-red-600 hover:bg-red-50"
            onClick={() => {
              removeProject(menuState.projectId);
              if (editingProjectId === menuState.projectId) {
                setEditingProjectId(null);
                setEditingProjectName("");
              }
              setMenuState(null);
            }}
          >
            Delete project
          </button>
        </div>
      )}
    </div>
  );
}
