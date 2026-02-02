import {
  getCurrnetDay,
  getCurrnetMonthInShort,
  getDaysInCurrentMonth,
} from "@/utils";
import AddList from "./AddListButton";
import ProgressBar from "./ProgressBar";

export default function Header() {
  const month = getCurrnetMonthInShort();
  const daysInMonth = getDaysInCurrentMonth();
  const currentDay = getCurrnetDay();

  return (
    <div className="border-b">
      <div className="px-3 py-2 md:py-4 md:px-8 flex items-center justify-between mx-auto gap-x-3 sm:gap-x-6">
        <div className="flex gap-x-3 sm:gap-x-6 items-center">
          <p className="sm:text-lg font-mono text-nowrap">
            {month},
            <span className="text-xl sm:text-2xl font-semibold">
              {currentDay}
            </span>
            /{daysInMonth}
          </p>
          <ProgressBar value={currentDay} max={daysInMonth} />
        </div>

        <AddList />
      </div>
    </div>
  );
}
