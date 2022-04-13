export interface Todo {
  id: string;
  title: string;
  isCompleted: boolean;
  isFavorited: boolean;
}

export interface TodoListItem extends Todo {
  isSaving: boolean;
}
