import { Plus } from "lucide-react";
import { useTodoStore } from "../hooks/useTodoStore";

export default function AddListButton() {
  const addList = useTodoStore((state) => state.addList);
  const activeProjectId = useTodoStore((state) => state.activeProjectId);
  return (
    <button
      className="text-lg hover:bg-neutral-100 rounded-sm p-0.5 cursor-pointer transition-all duration-200"
      onClick={() => addList({ name: "New List", projectId: activeProjectId })}
    >
      <Plus />
    </button>
  );
}
