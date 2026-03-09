interface TodoItem {
  id: string;
  position: number;
  content: string;
  listId: string;
  isFinished: boolean;
  isUrgent: boolean;
  finishedAt: number | null;
}

interface TodoList {
  id: string;
  position: number;
  listName: string;
  showFinished: boolean;
  projectId: string | null;
}

interface Project {
  id: string;
  position: number;
  name: string;
  isSystem: boolean;
}

interface TodoState {
  lists: TodoList[];
  items: TodoItem[];
  projects: Project[];
  activeProjectId: string;

  addList: (params: { name: string; projectId: string | null }) => void;
  editListName: (params: { name: string; listId: string }) => void;
  removeList: (listId: string) => void;
  toggleShowFinished: (listId: string) => void;
  addProject: (name: string) => void;
  editProjectName: (params: { name: string; projectId: string }) => void;
  removeProject: (projectId: string) => void;
  setActiveProjectId: (projectId: string) => void;
  moveListToProject: (params: { listId: string; projectId: string }) => void;

  addItem: (params: { content: string; listId: string }) => void;
  editItemContent: (params: { content: string; itemId: string }) => void;
  toggleIsFinished: (itemId: string) => void;
  toggleItemUrgent: (itemId: string) => void;
  changeItemOrder: (params: {
    activeId: string;
    overId: string;
    targetListId: string;
  }) => void;
  changeListOrder: (params: { activeId: string; overId: string }) => void;
  removeItem: (itemId: string) => void;
}

export type { TodoItem, TodoList, Project, TodoState };
