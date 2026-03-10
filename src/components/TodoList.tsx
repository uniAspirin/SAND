import { useTodoStore } from "../hooks/useTodoStore";
import TodoItem from "./TodoItem";
import { type TodoList } from "../types/todo";
import AddItem from "./AddItem";
// import RemoveListButton from "./RemoveListButton";
import CopyListButton from "./CopyListButton";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import TodoListDragHandle from "./TodoListDragHandle";
import { CSS } from "@dnd-kit/utilities";
import ProgressCircle from "./ProgressCircle";
import EyeButton from "./EyeButton";
import { useRef } from "react";

export default function TodoList({ list }: { list: TodoList }) {
  const { listName, id: listId, position } = list;
  const items = useTodoStore((state) => state.items);
  const sortedListItems = items
    .filter((item) => item.listId === listId)
    .sort((a, b) => {
      if (a.isUrgent !== b.isUrgent)
        return Number(b.isUrgent) - Number(a.isUrgent);
      return a.position - b.position;
    });
  const showedSortedListItems = list.showFinished
    ? sortedListItems
    : sortedListItems.filter((item) => !item.isFinished);
  const editListName = useTodoStore((state) => state.editListName);
  const addItemInputRef = useRef<HTMLTextAreaElement>(null);

  const { isOver, attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: listId,
      data: { role: "list", listId, position },
    });

  const moveStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const style =
    "flex flex-col items-center justify-start border border-neutral-200 bg-white shadow rounded-xl p-4 pt-1 h-full w-full max-w-140 md:max-w-none transition-all duration-200";
  const overStyle =
    "flex flex-col items-center justify-start border bg-neutral-100 shadow rounded-xl p-4 pt-1 h-full w-full max-w-140 md:max-w-none transition-all duration-200";

  return (
    <div
      ref={setNodeRef}
      style={moveStyle}
      {...attributes}
      className={isOver ? overStyle : style}
    >
      <TodoListDragHandle listeners={listeners} listId={listId} />
      <div className="flex items-center justify-between w-full mb-2">
        <input
          className="font-semibold text-2xl outline-none min-w-40 relative"
          value={listName}
          onChange={(e) => editListName({ name: e.target.value, listId })}
        />
        <div className="flex gap-3">
          <ProgressCircle todoItems={sortedListItems} size={24} />
          <EyeButton todoList={list} />
          <CopyListButton listItems={showedSortedListItems} />
          {/* <RemoveListButton listId={listId} /> */}
        </div>
      </div>

      <SortableContext
        items={showedSortedListItems}
        strategy={verticalListSortingStrategy}
      >
        <div className="overflow-y-auto w-full gap-2 flex flex-col mb-2">
          {showedSortedListItems.map((item) => (
            <TodoItem key={item.id} todoItem={item} />
          ))}
        </div>
        <AddItem listId={listId} ref={addItemInputRef} />
        <div
          className="grow min-h-0 w-full"
          onMouseDown={(e) => {
            e.preventDefault();
            if (e.target !== e.currentTarget) return;
            addItemInputRef.current?.focus();
          }}
        ></div>
      </SortableContext>
    </div>
  );
}
