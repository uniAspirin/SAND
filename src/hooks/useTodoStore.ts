import { create } from "zustand";
import type { TodoState } from "../types/todo";
import { persist, createJSONStorage } from "zustand/middleware";
import toast from "react-hot-toast";

const ALL_PROJECT_ID = "all";

export const useTodoStore = create<TodoState>()(
  persist(
    (set) => ({
      projects: [
        {
          id: ALL_PROJECT_ID,
          position: 0,
          name: "All",
          isSystem: true,
        },
      ],
      activeProjectId: ALL_PROJECT_ID,
      lists: [
        {
          id: "1767241298345",
          listName: "Hello there 😉",
          position: 1767241298345,
          showFinished: true,
          projectId: null,
        },
      ],
      items: [],

      addList({ name, projectId }) {
        const nextProjectId = projectId === ALL_PROJECT_ID ? null : projectId;
        set((state) => ({
          lists: [
            ...state.lists,
            {
              id: Date.now().toString(),
              listName: name,
              position: Date.now(),
              showFinished: true,
              projectId: nextProjectId,
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
          lists: state.lists.map((list) =>
            list.id === listId
              ? { ...list, showFinished: !list.showFinished }
              : list,
          ),
        }));
      },

      addProject(name) {
        set((state) => ({
          projects: [
            ...state.projects,
            {
              id: Date.now().toString(),
              position: Date.now(),
              name,
              isSystem: false,
            },
          ],
        }));
      },

      editProjectName({ name, projectId }) {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId && !project.isSystem
              ? { ...project, name }
              : project,
          ),
        }));
      },

      removeProject(projectId) {
        if (projectId === ALL_PROJECT_ID) return;
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== projectId),
          lists: state.lists.map((list) =>
            list.projectId === projectId ? { ...list, projectId: null } : list,
          ),
          activeProjectId:
            state.activeProjectId === projectId
              ? ALL_PROJECT_ID
              : state.activeProjectId,
        }));
      },

      setActiveProjectId(projectId) {
        set((state) => ({
          activeProjectId: state.projects.some(
            (project) => project.id === projectId,
          )
            ? projectId
            : ALL_PROJECT_ID,
        }));
      },

      moveListToProject({ listId, projectId }) {
        set((state) => {
          const targetList = state.lists.find((list) => list.id === listId);
          if (!targetList) return state;

          const nextProjectId = projectId === ALL_PROJECT_ID ? null : projectId;
          if (targetList.projectId === nextProjectId) return state;

          const targetProjectName =
            projectId === ALL_PROJECT_ID
              ? "All"
              : state.projects.find((project) => project.id === projectId)?.name;
          if (!targetProjectName) return state;

          toast.success(`Moved to ${targetProjectName}`);

          return {
            lists: state.lists.map((list) =>
              list.id === listId ? { ...list, projectId: nextProjectId } : list,
            ),
          };
        });
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
              isUrgent: false,
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
            .sort((a, b) => {
              if (a.isUrgent !== b.isUrgent) return Number(b.isUrgent) - Number(a.isUrgent);
              return a.position - b.position;
            });

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

      toggleItemUrgent(itemId) {
        set((state) => {
          const currentItem = state.items.find((item) => item.id === itemId);
          if (!currentItem) return state;

          const isTurningUrgent = !currentItem.isUrgent;
          const listItems = state.items
            .filter((item) => item.listId === currentItem.listId)
            .sort((a, b) => a.position - b.position);
          const minPosition = listItems.length > 0 ? listItems[0].position : Date.now();

          return {
            items: state.items.map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    isUrgent: isTurningUrgent,
                    position: isTurningUrgent ? minPosition / 2 : item.position,
                  }
                : item,
            ),
          };
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
      version: 4,
      migrate: (persistedState) => {
        const state = persistedState as {
          projects?: Array<{
            id: string;
            position: number;
            name: string;
            isSystem?: boolean;
          }>;
          activeProjectId?: string;
          lists?: Array<{
            id: string;
            position: number;
            listName: string;
            showFinished?: boolean;
            projectId?: string | null;
          }>;
          items?: Array<{
            id: string;
            position: number;
            content: string;
            listId: string;
            isFinished: boolean;
            isUrgent?: boolean;
            finishedAt: number | null;
          }>;
        };

        const projects =
          state.projects && state.projects.length > 0
            ? state.projects.map((project) => ({
                ...project,
                isSystem: project.id === ALL_PROJECT_ID ? true : false,
              }))
            : [
                {
                  id: ALL_PROJECT_ID,
                  position: 0,
                  name: "All",
                  isSystem: true,
                },
              ];
        const hasAllProject = projects.some(
          (project) => project.id === ALL_PROJECT_ID,
        );
        const normalizedProjects = hasAllProject
          ? projects
          : [
              {
                id: ALL_PROJECT_ID,
                position: 0,
                name: "All",
                isSystem: true,
              },
              ...projects,
            ];

        return {
          ...state,
          projects: normalizedProjects,
          activeProjectId:
            state.activeProjectId &&
            normalizedProjects.some(
              (project) => project.id === state.activeProjectId,
            )
              ? state.activeProjectId
              : ALL_PROJECT_ID,
          lists: (state.lists ?? []).map((list) => ({
            ...list,
            showFinished: list.showFinished ?? true,
            projectId: list.projectId ?? null,
          })),
          items: (state.items ?? []).map((item) => ({
            ...item,
            isUrgent: item.isUrgent ?? false,
          })),
        };
      },
    },
  ),
);
