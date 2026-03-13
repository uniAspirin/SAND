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
  const removeItem = useTodoStore((state) => state.removeItem);

  const [localContent, setLocalContent] = useState(content);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const target = textareaRef.current;
    if (target) {
      target.style.height = "26px";
      const newHeight = Math.max(target.scrollHeight, 26);
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
      const formattedContent = localContent.trim();
      if (formattedContent === "") removeItem(id);
      editItemContent({ content: formattedContent, itemId: id });
    }, 1000);
    return () => clearTimeout(timer);
  }, [localContent, id, editItemContent, removeItem, content]);

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
        isUrgent ? "bg-yellow-200/60" : ""
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
        className={`grow border-b w-full border-neutral-300 outline-none px-1 py-0.5 resize-none overflow-hidden text-sm ${
          isFinished ? "text-neutral-600" : ""
        }`}
      />
      <TodoItemDragHandle
        listeners={listeners}
        itemId={id}
        isUrgent={isUrgent}
      />
    </div>
  );
}
