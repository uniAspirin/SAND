interface TodoItem {
  id: string;
  position: number;
  content: string;
  listId: string;
  isFinished: boolean;
  finishedAt: number | null;
}

interface TodoList {
  id: string;
  position: number;
  listName: string;
  showFinished: boolean;
}

interface TodoState {
  lists: TodoList[];
  items: TodoItem[];

  addList: (name: string) => void;
  editListName: (params: { name: string; listId: string }) => void;
  removeList: (listId: string) => void;
  toggleShowFinished: (listId: string) => void;

  addItem: (params: { content: string; listId: string }) => void;
  editItemContent: (params: { content: string; itemId: string }) => void;
  toggleIsFinished: (itemId: string) => void;
  changeItemOrder: (params: {
    activeId: string;
    overId: string;
    targetListId: string;
  }) => void;
  changeListOrder: (params: { activeId: string; overId: string }) => void;
  removeItem: (itemId: string) => void;
}

export type { TodoItem, TodoList, TodoState };
