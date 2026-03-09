import { useTodoStore } from "@/hooks/useTodoStore";

interface ProgressBarProps {
  value: number;
  max: number;
  year: number;
  month: number;
}
type BlockType = "past" | "wasted" | "current" | "future";

export default function ProgressBar({ value, max, year, month }: ProgressBarProps) {
  const items = useTodoStore((state) => state.items);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const finishedItemsByDay = new Map<number, { id: string; content: string; finishedAt: number }[]>();
  const finishedDays = new Set<number>();
  items
    .filter((item) => item.isFinished && item.finishedAt)
    .forEach((item) => {
      const finishedDate = new Date(item.finishedAt!);
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
        finishedAt: item.finishedAt!,
      });
      finishedItemsByDay.set(day, dayItems);
      finishedDays.add(day);
    });
  finishedItemsByDay.forEach((dayItems) => {
    dayItems.sort((a, b) => a.finishedAt - b.finishedAt);
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

  return (
    <div className="relative group">
      <div
        className={`${colors[type]} size-3 sm:size-4 rounded-xs flex items-center justify-center`}
      />
      {(type === "past" || type === "current") && finishedItems.length > 0 && (
        <div className="hidden group-hover:block absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 w-64 rounded-md border border-neutral-200 bg-white p-2 shadow-lg">
          <p className="text-xs font-semibold text-neutral-700 mb-1">
            Day {day}
          </p>
          <div className="max-h-40 overflow-y-auto space-y-1">
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
                <p className="text-xs text-neutral-700 break-words">{item.content}</p>
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
