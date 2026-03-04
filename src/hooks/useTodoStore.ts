import { create } from "zustand";
import type { TodoState } from "../types/todo";
import { persist, createJSONStorage } from "zustand/middleware";
import toast from "react-hot-toast";

export const useTodoStore = create<TodoState>()(
  persist(
    (set) => ({
      lists: [
        {
          id: "1767241298345",
          listName: "Hello there 😉",
          position: 1767241298345,
          showFinished: true,
        },
      ],
      items: [],

      addList(name) {
        set((state) => ({
          lists: [
            ...state.lists,
            {
              id: Date.now().toString(),
              listName: name,
              position: Date.now(),
              showFinished: true,
            },
          ],
        }));
      },

      editListName({ name, listId }) {
        {
          set((state) => ({
            lists: state.lists.map((list) =>
              list.id === listId ? { ...list, listName: name } : list,
            ),
          }));
        }
      },

      removeList(listId) {
        set((state) => ({
          lists: state.lists.filter((list) => list.id !== listId),
          items: state.items.filter((item) => item.listId !== listId),
        }));
      },

      toggleShowFinished(listId) {
        set((state) => ({
          lists: state.lists.map((list) => {
            if (list.id === listId)
              return { ...list, showFinished: !list.showFinished };
            else return list;
          }),
        }));
      },

      addItem({ content, listId }) {
        set((state) => ({
          items: [
            ...state.items,
            {
              id: Math.random().toString(36).substring(2, 9),
              position: Date.now(),
              content,
              listId,
              isFinished: false,
              finishedAt: null,
            },
          ],
        }));
      },

      editItemContent({ content, itemId }) {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, content } : item,
          ),
        }));
      },

      changeItemOrder({ activeId, overId, targetListId }) {
        set((state) => {
          const sortedItems = state.items
            .filter((i) => i.listId === targetListId)
            .sort((a, b) => a.position - b.position);

          let calculatedPosition: number;

          // 1) over is a list
          if (overId === targetListId) {
            calculatedPosition = Date.now();
          }
          // 2) over is an item
          else {
            const activeIndex = sortedItems.findIndex((i) => i.id === activeId);
            const overIndex = sortedItems.findIndex((i) => i.id === overId);

            if (overIndex === 0) {
              // insert in the head
              calculatedPosition = sortedItems[0].position / 2;
            } else if (overIndex === sortedItems.length - 1) {
              // insert in the end
              calculatedPosition = Date.now();
            } else {
              // insert in the middle
              // move downwards
              if (activeIndex < overIndex) {
                const curPosition = sortedItems[overIndex].position;
                const nextPosition = sortedItems[overIndex + 1].position;
                calculatedPosition = (curPosition + nextPosition) / 2;
              } else {
                // move upwards
                const curPosition = sortedItems[overIndex].position;
                const nextPosition = sortedItems[overIndex - 1].position;
                calculatedPosition = (curPosition + nextPosition) / 2;
              }
            }
          }

          return {
            items: state.items.map((item) =>
              item.id === activeId
                ? {
                    ...item,
                    listId: targetListId,
                    position: calculatedPosition,
                  }
                : item,
            ),
          };
        });
      },

      toggleIsFinished(itemId) {
        set((state) => {
          const currentItem = state.items.find((item) => item.id === itemId);
          // 1) true => false
          if (currentItem?.isFinished === true) {
            return {
              items: state.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      isFinished: !item.isFinished,
                      finishedAt: null,
                    }
                  : item,
              ),
            };
          }
          // 2) false => true, move it to the top: set position to the smallest
          const sortedItems = state.items
            .filter((item) => item.listId === currentItem?.listId)
            .sort((a, b) => a.position - b.position);
          const newPosition = sortedItems[0].position / 2;
          const newItems = state.items.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  isFinished: !item.isFinished,
                  finishedAt: Date.now(),
                  position: newPosition,
                }
              : item,
          );
          // show toast if all todos in list are finished
          const allFinished = sortedItems
            .filter((item) => item.id !== itemId)
            .every((item) => item.isFinished);
          if (allFinished) {
            toast("Good Job!!!!!!", {
              icon: "👏👏👏",
            });
          }
          return { items: newItems };
        });
      },

      removeItem(itemId) {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      },

      changeListOrder({ activeId, overId }) {
        set((state) => {
          const sortedItems = state.lists.sort(
            (a, b) => a.position - b.position,
          );

          let calculatedPosition: number;

          const activeIndex = sortedItems.findIndex((i) => i.id === activeId);
          const overIndex = sortedItems.findIndex((i) => i.id === overId);

          // insert in the head
          if (overIndex === 0) {
            calculatedPosition = sortedItems[0].position / 2;
            // insert in the end
          } else if (overIndex === sortedItems.length - 1) {
            calculatedPosition = Date.now();
            // insert in the middle
          } else {
            // move downwards
            if (activeIndex < overIndex) {
              const curPosition = sortedItems[overIndex].position;
              const nextPosition = sortedItems[overIndex + 1].position;
              calculatedPosition = (curPosition + nextPosition) / 2;
            } else {
              // move upwards
              const curPosition = sortedItems[overIndex].position;
              const nextPosition = sortedItems[overIndex - 1].position;
              calculatedPosition = (curPosition + nextPosition) / 2;
            }
          }

          return {
            lists: state.lists.map((list) =>
              list.id === activeId
                ? {
                    ...list,
                    position: calculatedPosition,
                  }
                : list,
            ),
          };
        });
      },
    }),

    {
      name: "todo-storage",
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as {
          lists?: Array<{
            id: string;
            position: number;
            listName: string;
            showFinished?: boolean;
          }>;
          items?: unknown[];
        };

        return {
          ...state,
          lists: (state.lists ?? []).map((list) => ({
            ...list,
            showFinished: list.showFinished ?? true,
          })),
        };
      },
    },
  ),
);
