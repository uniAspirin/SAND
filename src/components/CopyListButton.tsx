import { Share } from "lucide-react";
import type { TodoItem } from "../types/todo";
import toast from "react-hot-toast";

interface CopyListButtonProps {
  listItems: TodoItem[];
}

export default function CopyListButton({ listItems }: CopyListButtonProps) {
  function getFormatContent() {
    const body = listItems.map((item) => item.content).join("\n");
    return body;
  }

  async function handleCopy() {
    if (listItems.length === 0) return;

    const text = getFormatContent();
    await navigator.clipboard.writeText(text);

    toast.success("Copied to your clipboard");
  }

  return (
    <button
      className="hover:bg-neutral-100 rounded-sm p-0.5 cursor-pointer transition-all duration-200"
      onClick={handleCopy}
      title="Copy as plain text"
    >
      <Share size={18} className="text-neutral-500" />
    </button>
  );
}
