import { Circle } from "lucide-react";
import { useTodoStore } from "../hooks/useTodoStore";
import { forwardRef, useState } from "react";

const AddItem = forwardRef<HTMLTextAreaElement, {
  listId: string;
}> (function AddItem({
  listId,
}, ref) {
  const [content, setContent] = useState("");
  const addItem = useTodoStore((state) => state.addItem);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter" && content.trim() && !e.shiftKey) {
      e.preventDefault();
      content
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line)
        .forEach((line) => {
          addItem({ content: line, listId });
        });

      setContent("");
      e.currentTarget.style.height = "29px";
    }
  };
  const handleOnBlur = (target: HTMLTextAreaElement) => {
    if (!content.trim()) return;
    content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line)
      .forEach((line) => {
        addItem({ content: line, listId });
      });

    setContent("");
    target.style.height = "29px";
  };
  return (
    <div className="flex items-start gap-2 w-full">
      <button className="mt-0.5">
        <Circle className="text-neutral-300" />
      </button>
      {/* <input
        className="border-b border-dashed w-full placeholder:text-neutral-300 border-neutral-300 text-neutral-800 outline-none px-1 py-0.5"
        placeholder="new todo"
        onKeyDown={handleKeyDown}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      /> */}
      <textarea
        ref={ref}
        className="w-full bg-transparent border-b border-dashed border-neutral-300 text-neutral-400 outline-none px-1 py-0.5 resize-none text-sm overflow-hidden placeholder:text-neutral-300 h-[26px] min-h-[26px] leading-[20px]"
        placeholder="new todo"
        onKeyDown={handleKeyDown}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onBlur={(e) => handleOnBlur(e.currentTarget)}
        onInput={(e) => {
          const target = e.target as HTMLTextAreaElement;
          target.style.height = "29px"; // 1. 重置回初始高度
          // 2. 取 scrollHeight 和 29px 之间的最大值
          const newHeight = Math.max(target.scrollHeight, 29);
          target.style.height = `${newHeight}px`;
        }}
      />
    </div>
  );
});

export default AddItem;
