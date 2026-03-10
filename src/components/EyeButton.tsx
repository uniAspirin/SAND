import { useTodoStore } from "@/hooks/useTodoStore";
import type { TodoList } from "@/types/todo";
import { Eye, EyeClosed } from "lucide-react";

interface EyeButtonProps {
  todoList: TodoList;
}

export default function EyeButton({ todoList }: EyeButtonProps) {
  const toggleShowFinished = useTodoStore((state) => state.toggleShowFinished);
  return (
    <button
      className="hover:bg-neutral-100 rounded-sm p-0.5 cursor-pointer transition-all duration-200"
      onClick={() => toggleShowFinished(todoList.id)}
      title="Toggle display for finished items"
    >
      {todoList.showFinished ? (
        <Eye size={20} className="text-neutral-500" />
      ) : (
        <EyeClosed size={20} className="text-neutral-500" />
      )}
    </button>
  );
}
