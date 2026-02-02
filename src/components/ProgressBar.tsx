import { useTodoStore } from "@/hooks/useTodoStore";

interface ProgressBarProps {
  value: number;
  max: number;
}
type BlockType = "past" | "wasted" | "current" | "future";

export default function ProgressBar({ value, max }: ProgressBarProps) {
  const items = useTodoStore((state) => state.items);
  const finishedDays = new Set(
    items
      .filter((item) => item.isFinished && item.finishedAt)
      .map((item) => new Date(item.finishedAt!).getDate()),
  );

  return (
    <div className="flex gap-1 flex-wrap">
      {Array.from({ length: max }).map((_, index) => {
        const day = index + 1;
        let type: "past" | "wasted" | "current" | "future";

        if (day < value) {
          type = finishedDays.has(day) ? "past" : "wasted";
        } else if (day === value) {
          type = "current";
        } else {
          type = "future";
        }
        return <Block key={index} type={type} />;
      })}
    </div>
  );
}

function Block({ type }: { type: BlockType }) {
  const colors = {
    past: "bg-neutral-800",
    // wasted: "border-2 border-neutral-600 relative overflow-hidden",
    wasted: "bg-neutral-400/70",
    current: "bg-yellow-400",
    future: "bg-neutral-200/50",
  };

  return (
    <div
      className={`${colors[type]} size-3 sm:size-4 rounded-xs flex items-center justify-center`}
    >
      {/* {type === "wasted" && (
        <svg
          className="absolute inset-0 size-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <line
            x1="0"
            y1="0"
            x2="100"
            y2="100"
            stroke="currentColor"
            strokeWidth="18"
            className="text-neutral-600"
          />
        </svg>
      )} */}
    </div>
  );
}
