import { Check, Circle } from "lucide-react";
import type { TodoItem } from "../types/todo";
import { useTodoStore } from "../hooks/useTodoStore";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useRef, useState } from "react";
import TodoItemDragHandle from "./TodoItemDragHandle";

export default function TodoItem({ todoItem }: { todoItem: TodoItem }) {
  const { id, content, isFinished, isUrgent, listId, position } = todoItem;
  const toggleIsFinished = useTodoStore((state) => state.toggleIsFinished);
  const editItemContent = useTodoStore((state) => state.editItemContent);

  const [localContent, setLocalContent] = useState(content);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const adjustHeight = () => {
    const target = textareaRef.current;
    if (target) {
      target.style.height = "29px";
      const newHeight = Math.max(target.scrollHeight, 29);
      target.style.height = `${newHeight}px`;
    }
  };

  // adjust height
  useEffect(() => {
    adjustHeight();
  }, [localContent]);

  useEffect(() => {
    const handleResize = () => {
      adjustHeight();
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // debounce
  useEffect(() => {
    if (localContent === content) return;
    const timer = setTimeout(() => {
      editItemContent({ content: localContent.trim(), itemId: id });
    }, 800);
    return () => clearTimeout(timer);
  }, [localContent, id, editItemContent, content]);

  // when content updates, sync local content
  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id, data: { role: "item", listId, position } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      className={`flex items-start w-full rounded-md ${
        isUrgent ? "bg-red-100/80 px-1.5 py-1" : ""
      }`}
      ref={setNodeRef}
      style={style}
      {...attributes}
    >
      <button onClick={() => toggleIsFinished(id)} className="mt-0.5 mr-2">
        {isFinished ? (
          <div className="size-6 rounded-full overflow-clip bg-neutral-300 flex items-center justify-center">
            <Check size={13} strokeWidth={5} className="text-neutral-50" />
          </div>
        ) : (
          <Circle className="text-neutral-300" />
        )}
      </button>
      <textarea
        ref={textareaRef}
        value={localContent}
        onChange={(e) => setLocalContent(e.target.value)}
        className={`grow border-b w-full border-neutral-300 outline-none px-1 py-0.5 resize-none overflow-hidden ${
          isFinished ? "text-neutral-600" : ""
        }`}
      />
      <TodoItemDragHandle listeners={listeners} itemId={id} isUrgent={isUrgent} />
    </div>
  );
}
