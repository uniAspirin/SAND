import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragCancelEvent,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import Header from "./components/Header";
import TodoList from "./components/TodoList";
import TodoListOverlay from "./components/TodoListOverlay";
import { useTodoStore } from "./hooks/useTodoStore";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import TodoItem from "./components/TodoItem";
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import ProjectBar from "./components/ProjectBar";

function App() {
  const items = useTodoStore((state) => state.items);
  const lists = useTodoStore((state) => state.lists);
  const activeProjectId = useTodoStore((state) => state.activeProjectId);
  const removeItem = useTodoStore((state) => state.removeItem);
  const removeList = useTodoStore((state) => state.removeList);
  const changeItemOrder = useTodoStore((state) => state.changeItemOrder);
  const changeListOrder = useTodoStore((state) => state.changeListOrder);

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activeId, setActiveId] = useState<string | number>("");
  const [activeRole, setActiveRole] = useState<string>("");

  function handleDragStart(e: DragStartEvent) {
    console.log(e.active.data);
    setIsDragging(true);
    setActiveId(e.active.id);
    setActiveRole(e.active.data.current?.role);
  }
  function handleDragEnd(e: DragEndEvent) {
    // update OverLay
    setIsDragging(false);
    setActiveId("");
    setActiveRole("");

    // base on role
    const { active, over } = e;
    const activeRole = active.data.current?.role;
    const overRole = over?.data.current?.role;
    // 1. same place, return
    if (!over) return;
    // 2. delete area, delete it
    if (over.id === "delete") {
      if (activeRole === "item") {
        removeItem(active.id as string);
      } else if (activeRole === "list") {
        removeList(active.id as string);
      }
      return;
    }

    if (activeRole === "list" && overRole === "list") {
      changeListOrder({
        activeId: active.id as string,
        overId: over.id as string,
      });
      return;
    }

    if (activeRole !== "item") return;

    const overData = over?.data.current;
    // disable: drag over an item in another list
    if (
      active.data.current?.listId !== over.data.current?.listId &&
      overRole === "item"
    ) {
      return;
    }

    // 3. handle item order change
    const targetListId = overData?.listId;
    if (!targetListId) return;
    changeItemOrder({
      activeId: active.id as string,
      overId: over.id as string,
      targetListId,
    });
  }

  function handleDragCancel(_: DragCancelEvent) {
    setIsDragging(false);
    setActiveId("");
    setActiveRole("");
  }

  function handleOverlay() {
    if (activeRole === "list") {
      return (
        <TodoListOverlay list={lists.find((list) => list.id === activeId)!} />
      );
    } else if (activeRole === "item") {
      return (
        <TodoItem todoItem={items.filter((item) => item.id === activeId)[0]} />
      );
    } else {
      return null;
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      // Press delay of 250ms, with tolerance of 5px of movement
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
  );

  if (lists.length === 0) toast("add a new list first :)");

  const visibleLists =
    activeProjectId === "all"
      ? lists
      : lists.filter((list) => list.projectId === activeProjectId);
  const sortedVisibleLists = [...visibleLists].sort(
    (a, b) => a.position - b.position,
  );

  return (
    <DndContext
      sensors={sensors}
      autoScroll={activeRole !== "list"}
      // collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="h-dvh flex flex-col">
        <Header />
        <div
          className={`grow bg-neutral-100 ${isDragging && activeRole === "list" ? "overflow-hidden" : "overflow-y-scroll"}`}
        >
          <main
            className="min-h-full flex flex-col items-center px-1.5 py-3 gap-4 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:p-6 mx-auto"
            style={{
              // 2. 强制分为两行，每行平分高度 (或者根据需求设置具体高度)
              gridAutoRows: "350px",
              // 3. 内容溢出时，自动向右增加，而不是向下
              gridAutoFlow: "row",
              // 4. 确保每一列的宽度固定，不会被压缩
              gridAutoColumns: "350px",
            }}
          >
            <SortableContext
              items={sortedVisibleLists}
              strategy={rectSortingStrategy}
            >
              {sortedVisibleLists.map((list) => (
                <TodoList key={list.id} list={list} />
              ))}
            </SortableContext>
            {/* {isDragging && <DeleteArea />} */}
          </main>
        </div>
        <ProjectBar />
      </div>
      <DragOverlay>{handleOverlay()}</DragOverlay>
      <Toaster />
    </DndContext>
  );
}

export default App;
