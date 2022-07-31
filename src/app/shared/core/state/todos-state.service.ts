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
  saving: boolean;
  todos: Todo[];
  filters: TodoFilters;
  todosBeingSaved: Record<string, true | undefined>
}

@Injectable({
  providedIn: 'root'
})
export class TodosStateService {

  /**
   * Estado principal representado por um BehaviorSubject, que tem o conceito de "valor atual"
   */
  private state$ = new BehaviorSubject<TodosState>({
    loaded: false,
    loading: false,
    todos: [],
    saving: false,
    filters: {
      isCompleted: null,
      title: null,
    },
    todosBeingSaved: {},
  });

  constructor() { }

  /**
   * Utilizamos essa função para expor o estado como um Observable, 
   * para evitar que os métodos de next/error/complete BehaviorSubject fiquem expostos
   */
  getState(): Observable<TodosState> {
    return this.state$.asObservable();
  }

  /* 
  Métodos de atualização do estado. Percebam que nós estamos sempre gerando um novo objeto literal, usando o operador
   ... spread para copiar o estado antigo e alterar somente o que for necessário
*/

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
        if (t.id === todo.id) {
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

  setSaving(saving: boolean) {
    this.state$.next({
      ...this.state$.getValue(),
      saving: saving,
    });
  }

  setFilters(filters: TodoFilters) {
    this.state$.next({
      ...this.state$.getValue(),
      filters: filters,
    });
  }

  setTodoBeingSaved(todoId: string) {
    const state = this.state$.getValue();
    this.state$.next({
      ...state,
      todosBeingSaved: {
        ...state.todosBeingSaved,
        // adicionamos o id do Todo aqui como true para indicar que ele está sendo salvo
        [todoId]: true,
      },
    });
  }

  setTodoNotBeingSaved(todoId: string) {
    const state = this.state$.getValue();
    this.state$.next({
      ...state,
      todosBeingSaved: {
        ...state.todosBeingSaved,
        // setamos o todoId aqui para undefined para "remover" o item do objeto
        [todoId]: undefined
      },
    });
  }




}
