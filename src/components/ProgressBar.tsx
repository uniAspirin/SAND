import { useTodoStore } from "@/hooks/useTodoStore";
import { useEffect, useRef, useState } from "react";

interface ProgressBarProps {
  value: number;
  max: number;
  year: number;
  month: number;
}
type BlockType = "past" | "wasted" | "current" | "future";

export default function ProgressBar({
  value,
  max,
  year,
  month,
}: ProgressBarProps) {
  const items = useTodoStore((state) => state.items);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const finishedItemsByDay = new Map<
    number,
    { id: string; content: string; finishedAt: number }[]
  >();
  const finishedDays = new Set<number>();
  items
    .filter((item) => item.isFinished)
    .forEach((item) => {
      const inferredFinishedAt =
        typeof item.finishedAt === "number"
          ? item.finishedAt
          : item.position > 1_000_000_000_000
            ? item.position
            : null;
      if (!inferredFinishedAt) return;

      const finishedDate = new Date(inferredFinishedAt);
      if (
        finishedDate.getFullYear() !== year ||
        finishedDate.getMonth() !== month
      ) {
        return;
      }
      const day = finishedDate.getDate();
      const dayItems = finishedItemsByDay.get(day) ?? [];
      dayItems.push({
        id: item.id,
        content: item.content,
        finishedAt: inferredFinishedAt,
      });
      finishedItemsByDay.set(day, dayItems);
      finishedDays.add(day);
    });
  finishedItemsByDay.forEach((dayItems) => {
    dayItems.sort((a, b) => b.finishedAt - a.finishedAt);
  });

  return (
    <div className="flex gap-1 flex-wrap">
      {Array.from({ length: max }).map((_, index) => {
        const day = index + 1;
        let type: "past" | "wasted" | "current" | "future";
        const isCurrentView = year === currentYear && month === currentMonth;
        const isPastView =
          year < currentYear || (year === currentYear && month < currentMonth);

        if (isPastView) {
          type = finishedDays.has(day) ? "past" : "wasted";
        } else if (isCurrentView) {
          if (day < value) {
            type = finishedDays.has(day) ? "past" : "wasted";
          } else if (day === value) {
            type = "current";
          } else {
            type = "future";
          }
        } else {
          type = "future";
        }
        return (
          <Block
            key={index}
            type={type}
            day={day}
            finishedItems={finishedItemsByDay.get(day) ?? []}
          />
        );
      })}
    </div>
  );
}

function Block({
  type,
  day,
  finishedItems,
}: {
  type: BlockType;
  day: number;
  finishedItems: { id: string; content: string; finishedAt: number }[];
}) {
  const colors = {
    past: "bg-yellow-400",
    // wasted: "border-2 border-neutral-600 relative overflow-hidden",
    wasted: "bg-neutral-200/50",
    current: "bg-[#bc012c] shadow-[0_0_4px] shadow-[#bc012c]",
    future: "bg-neutral-200/50",
  };
  const [isOpen, setIsOpen] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const canShowMenu =
    (type === "past" || type === "current") && finishedItems.length > 0;

  function openMenu() {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsOpen(true);
  }

  function closeMenuWithDelay() {
    closeTimerRef.current = window.setTimeout(() => {
      setIsOpen(false);
      closeTimerRef.current = null;
    }, 100);
  }

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  return (
    <div
      className="relative"
      onMouseEnter={openMenu}
      onMouseLeave={closeMenuWithDelay}
    >
      <div
        className={`${colors[type]} size-3 sm:size-4 rounded-xs flex items-center justify-center`}
      />
      {canShowMenu && isOpen && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 w-64 rounded-md border border-neutral-200 bg-white p-2 shadow-lg">
          <p className="text-xs font-semibold text-neutral-700 mb-1">
            Day {day} ({finishedItems.length})
          </p>
          <div className="max-h-72 overflow-y-auto space-y-1">
            {finishedItems.map((item) => (
              <div key={item.id} className="rounded-sm bg-neutral-50 px-2 py-1">
                <p className="text-[11px] text-neutral-500">
                  {new Date(item.finishedAt).toLocaleString([], {
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-xs text-neutral-700 wrap-break-word">
                  {item.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
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
