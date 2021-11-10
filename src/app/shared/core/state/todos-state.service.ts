import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Todo } from '../../types/todo.type';

export interface TodoFilters {
  title: string | null;
  isCompleted: boolean | null;
}

export interface TodosState {
  loaded: boolean;
  loading: boolean;
  todos: Todo[];
  filters: TodoFilters;
}

@Injectable({
  providedIn: 'root'
})
export class TodosStateService {

  private state$ = new BehaviorSubject<TodosState>({
    loaded: false,
    loading: false,
    todos: [],
    filters: {
      isCompleted: null,
      title: null,
    }
  });

  constructor() { }

  getState(): Observable<TodosState> {
    return this.state$.asObservable();
  }

  setTodos(todos: Todo[]) {
    this.state$.next({
      ...this.state$.getValue(),
      todos: todos,
    });
  }

  addTodo(todo: Todo) {
    const state = this.state$.getValue();
    this.state$.next({
      ...state,
      todos: [
        ...state.todos,
        todo,
      ],
    });
  }

  editTodo(todo: Todo) {
    const state = this.state$.getValue();
    this.state$.next({
      ...state,
      todos: state.todos.map(t => {
        // trocando o todo antigo pelo todo novo se id for igual
        if(t.id === todo.id) {
          return todo;
        }
        return t;
      }),
    });
  }

  removeTodo(id: string) {
    const state = this.state$.getValue();
    this.state$.next({
      ...state,
      todos: state.todos.filter(todo => todo.id !== id),
    });
  }

  setLoading(loading: boolean) {
    this.state$.next({
      ...this.state$.getValue(),
      loading: loading,
    });
  }

  setLoaded(loaded: boolean) {
    this.state$.next({
      ...this.state$.getValue(),
      loaded: loaded,
    });
  }

  setFilters(filters: TodoFilters) {
    this.state$.next({
      ...this.state$.getValue(),
      filters: filters,
    });
  }




}
