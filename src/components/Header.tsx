import { useTodoStore } from "@/hooks/useTodoStore";
import AddList from "./AddListButton";
import ProgressBar from "./ProgressBar";
import { useEffect, useMemo, useRef, useState } from "react";

type MonthOption = {
  year: number;
  month: number;
  label: string;
  key: string;
  hasFinished: boolean;
  isCurrent: boolean;
};

export default function Header() {
  const items = useTodoStore((state) => state.items);
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();
  const [isMonthMenuOpen, setIsMonthMenuOpen] = useState(false);
  const [selectedYearMonth, setSelectedYearMonth] = useState<{
    year: number;
    month: number;
  }>({ year: currentYear, month: currentMonth });
  const monthMenuRef = useRef<HTMLDivElement>(null);

  const finishedMonthKeys = useMemo(() => {
    const keys = new Set<string>();
    items
      .filter((item) => item.isFinished && item.finishedAt)
      .forEach((item) => {
        const finishedDate = new Date(item.finishedAt!);
        keys.add(`${finishedDate.getFullYear()}-${finishedDate.getMonth()}`);
      });
    return keys;
  }, [items]);

  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }).map((_, index) => {
      const date = new Date(currentYear, currentMonth - index, 1);
      const year = date.getFullYear();
      const month = date.getMonth();
      const key = `${year}-${month}`;
      const isCurrent = year === currentYear && month === currentMonth;
      return {
        year,
        month,
        key,
        isCurrent,
        hasFinished: isCurrent || finishedMonthKeys.has(key),
        label: new Intl.DateTimeFormat("en-US", {
          month: "short",
          year: "numeric",
        }).format(date),
      } satisfies MonthOption;
    });
  }, [currentMonth, currentYear, finishedMonthKeys]);

  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
  }).format(new Date(selectedYearMonth.year, selectedYearMonth.month, 1));
  const daysInMonth = new Date(
    selectedYearMonth.year,
    selectedYearMonth.month + 1,
    0,
  ).getDate();
  const isCurrentView =
    selectedYearMonth.year === currentYear &&
    selectedYearMonth.month === currentMonth;
  const displayDay = isCurrentView ? currentDay : daysInMonth;

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (!monthMenuRef.current?.contains(e.target as Node)) {
        setIsMonthMenuOpen(false);
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setIsMonthMenuOpen(false);
    }

    window.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <div className="border-b">
      <div className="px-3 py-2 md:px-8 flex items-center justify-between mx-auto gap-x-3 sm:gap-x-6">
        <div className="flex gap-x-3 sm:gap-x-6 items-center">
          <div ref={monthMenuRef} className="relative">
            <button
              className="sm:text-lg font-mono text-nowrap hover:bg-neutral-100 rounded-sm px-1 py-0.5"
              onClick={() => setIsMonthMenuOpen((prev) => !prev)}
              title="Switch month display"
            >
              {monthLabel},
              <span className="text-xl sm:text-2xl font-semibold">
                {displayDay}
              </span>
              /{daysInMonth}
            </button>

            {isMonthMenuOpen && (
              <div className="absolute top-full mt-2 left-0 z-50 min-w-44 rounded-md border border-neutral-200 bg-white p-1 shadow-lg">
                {monthOptions.map((option) => (
                  <button
                    key={option.key}
                    disabled={!option.hasFinished}
                    className={`w-full rounded-sm px-2 py-1 text-left text-sm font-mono ${
                      option.hasFinished
                        ? "hover:bg-neutral-100 text-neutral-700"
                        : "text-neutral-400 cursor-not-allowed"
                    }`}
                    onClick={() => {
                      if (!option.hasFinished) return;
                      setSelectedYearMonth({
                        year: option.year,
                        month: option.month,
                      });
                      setIsMonthMenuOpen(false);
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <ProgressBar
            value={displayDay}
            max={daysInMonth}
            year={selectedYearMonth.year}
            month={selectedYearMonth.month}
          />
        </div>

        <AddList />
      </div>
    </div>
  );
}
