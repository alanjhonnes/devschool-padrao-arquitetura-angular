import { Injectable } from '@angular/core';
import { Observable, of, combineLatest } from 'rxjs';
import { distinctUntilChanged, filter, map, shareReplay, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';
import { TodosApiService } from '../core/async/todos-api.service';
import { TodoFilters, TodosStateService } from '../core/state/todos-state.service';
import { Todo } from '../types/todo.type';

@Injectable({
  providedIn: 'root'
})
export class TodosFacadeService {

  readonly allTodos$ = this.todosState
    .getState()
    .pipe(
      map(state => state.todos),
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

  readonly filteredTodos$ = combineLatest([this.allTodos$, this.filters$])
    .pipe(map(([todos, filters]) => {
      return todos.filter(todo => {
        if (filters.isCompleted !== null) {
          if(todo.isCompleted !== filters.isCompleted) {
            return false;
          }
        }
        if(filters.title !== null && filters.title !== '') {
          if(!todo.title.toLocaleLowerCase().includes(filters.title.toLocaleLowerCase())) {
            return false;
          }
        }
        return true;
      })
    }))

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
    return this.todosApi.createTodo(todo)
      .pipe(
        tap((response) => {
          this.todosState.addTodo(response);
        })
      )
  }

  editTodo(todo: Todo): Observable<Todo> {
    this.todosState.editTodo(todo);
    return this.todosApi.editTodo(todo)
      .pipe(
        tap((response) => {
          this.todosState.editTodo(response);
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
