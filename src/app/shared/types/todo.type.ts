export interface Todo {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isFavorited: boolean;
}

export interface TodoListItem extends Todo {
  isSaving: boolean;
}

export interface TodoState {
  loading: boolean;
  todo: Todo | null;
}