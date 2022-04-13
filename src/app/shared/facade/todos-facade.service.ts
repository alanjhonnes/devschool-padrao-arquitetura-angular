import { Injectable } from '@angular/core';
import { Observable, of, combineLatest } from 'rxjs';
import { catchError, distinctUntilChanged, filter, finalize, map, shareReplay, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';
import { TodosApiService } from '../core/async/todos-api.service';
import { TodoFilters, TodosStateService } from '../core/state/todos-state.service';
import { Todo, TodoListItem } from '../types/todo.type';

@Injectable({
  providedIn: 'root'
})
export class TodosFacadeService {

  readonly allTodos$ = this.todosState
    .getState()
    .pipe(
      tap(state => console.log(state)),
      map(state => {
        return state.todos
          .map<TodoListItem>(todo => {
            return {
              ...todo,
              isSaving: state.todosBeingSaved[todo.id] || false
            }
          })
      }),
      distinctUntilChanged(),
      shareReplay(1),
    )

  readonly filters$ = this.todosState
    .getState()
    .pipe(
      map((state) => state.filters),
      distinctUntilChanged(),
      shareReplay(1),
    );

  readonly loading$ = this.todosState
    .getState()
    .pipe(
      map((state) => state.loading),
      distinctUntilChanged(),
      shareReplay(1),
    );

  readonly saving$ = this.todosState
    .getState()
    .pipe(
      map((state) => state.saving),
      distinctUntilChanged(),
      shareReplay(1),
    );

  readonly filteredTodos$ = combineLatest([this.allTodos$, this.filters$])
    .pipe(
      map(([todos, filters]) => {
        return todos.filter(todo => {
          if (filters.isCompleted !== null) {
            if (todo.isCompleted !== filters.isCompleted) {
              return false;
            }
          }
          if (filters.title !== null && filters.title !== '') {
            if (!todo.title.toLocaleLowerCase().includes(filters.title.toLocaleLowerCase())) {
              return false;
            }
          }
          return true;
        })
      }))

  readonly orderedTodos$ = this.filteredTodos$
    .pipe(
      map(orderTodosByFavorites)
    )

  readonly todosCount$ = this.allTodos$
    .pipe(map(todos => todos.length))

  readonly todosCompleted$ = this.allTodos$
    .pipe(map(todos => todos.filter(todo => todo.isCompleted)))

  readonly todosCompletedCount$ = this.todosCompleted$
    .pipe(map(todos => todos.length))

  constructor(
    private todosApi: TodosApiService,
    private todosState: TodosStateService,
  ) { }


  loadTodos(): Observable<Todo[]> {
    return this.todosState
      .getState()
      .pipe(
        take(1),
        switchMap(state => {
          if (state.loaded) {
            // todos já carregados, só retornamos a lista já carregada
            return of(state.todos)
          } else {
            return this.todosApi
              .getTodos()
              .pipe(tap((todos) => {
                this.todosState.setTodos(todos);
                this.todosState.setLoaded(true);
              }))
          }
        })
      )
  }

  addTodo(todo: Todo): Observable<Todo> {
    this.todosState.setSaving(true);
    return this.todosApi.createTodo(todo)
      .pipe(
        tap((response) => {
          this.todosState.addTodo(response);
        }),
        finalize(() => {
          this.todosState.setSaving(false);
        })
      )
  }

  editTodo(todo: Todo): Observable<Todo> {
    // this.todosState.editTodo(todo);
    this.todosState.setTodoBeingSaved(todo.id)
    return this.todosApi.editTodo(todo)
      .pipe(
        tap((response) => {
          this.todosState.editTodo(response);
        }),
        finalize(() => {
          this.todosState.setTodoNotBeingSaved(todo.id)
        })
      )
  }

  deleteTodo(todo: Todo) {
    return this.todosApi.deleteTodo(todo)
      .pipe(
        tap(() => {
          this.todosState.removeTodo(todo.id);
        })
      );
  }

  updateTodosFilters(filters: TodoFilters) {
    this.todosState.setFilters(filters);
  }
}

export function orderTodosByFavorites(todos: TodoListItem[]): TodoListItem[] {
  return todos.slice()
    .sort((a, b) => {
      if (a.isFavorited && !b.isFavorited) {
        return -1;
      }
      if (a.isFavorited && b.isFavorited) {
        return 0;
      }
      return 1;
    });
}

