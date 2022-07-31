import { Injectable } from '@angular/core';
import { Observable, of, combineLatest } from 'rxjs';
import { catchError, distinctUntilChanged, filter, finalize, map, retry, shareReplay, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';
import { TodosApiService } from '../core/async/todos-api.service';
import { TodoFilters, TodosStateService } from '../core/state/todos-state.service';
import { Todo, TodoListItem } from '../types/todo.type';

@Injectable({
  providedIn: 'root'
})
export class TodosFacadeService {

  /**
   * Todos as tarefas incluindo se ela está sendo salva ou não
   */
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

  /**
   * Estado atual dos filtros
   */
  readonly filters$ = this.todosState
    .getState()
    .pipe(
      map((state) => state.filters),
      distinctUntilChanged(),
      shareReplay(1),
    );

  /**
   * Estado de loading das tarefas
   */
  readonly loading$ = this.todosState
    .getState()
    .pipe(
      map((state) => state.loading),
      distinctUntilChanged(),
      shareReplay(1),
    );

  /**
   * Estado de salvamento de uma nova tarefa
   */
  readonly saving$ = this.todosState
    .getState()
    .pipe(
      map((state) => state.saving),
      distinctUntilChanged(),
      shareReplay(1),
    );

  /**
   * Lista de tarefas filtradas com base nos filtros atuais
   */
  readonly filteredTodos$ = combineLatest([this.allTodos$, this.filters$])
    .pipe(
      map(([todos, filters]) => {
        return todos.filter(todo => {
          // filtragem de completo, se for nulo não fazemos nada pois representa "todos"
          if (filters.isCompleted !== null) {
            if (todo.isCompleted !== filters.isCompleted) {
              return false;
            }
          }
          // filtro pelo nome
          if (filters.title !== null && filters.title !== '') {
            if (!todo.title.toLocaleLowerCase().includes(filters.title.toLocaleLowerCase())) {
              return false;
            }
          }
          return true;
        })
      }))

  /**
   * Tarefas filtradas e ordenadas por favoritos
   */
  readonly orderedTodos$ = this.filteredTodos$
    .pipe(
      map(orderTodosByFavorites)
    )

  /**
   * o número total de tarefas
   */
  readonly todosCount$ = this.allTodos$
    .pipe(map(todos => todos.length))

  /**
   * Lista de tarefas completadas
   */
  readonly todosCompleted$ = this.allTodos$
    .pipe(map(todos => todos.filter(todo => todo.isCompleted)))

  /**
   * Número total de tarefas completadas
   */
  readonly todosCompletedCount$ = this.todosCompleted$
    .pipe(map(todos => todos.length))

  constructor(
    private todosApi: TodosApiService,
    private todosState: TodosStateService,
  ) { }


  /**
   * Ordena que as tarefas sejam carregadas do backend ou do cache
   */
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
            this.todosState.setLoading(true);
            return this.todosApi
              .getTodos()
              .pipe(
                tap((todos) => {
                  this.todosState.setTodos(todos);
                  this.todosState.setLoaded(true);
                }),
                finalize(() => {
                  this.todosState.setLoading(false);
                })
              )
          }
        })
      )
  }

  /**
   * Adiciona uma nova tarefa
   */
  addTodo(todo: Todo): Observable<Todo> {
    // inicializamos o estado de "saving"
    this.todosState.setSaving(true);
    return this.todosApi.createTodo(todo)
      .pipe(
        tap((response) => {
          // se a resposta for bem sucedida nós adicionamos a tarefa 
          this.todosState.addTodo(response);
        }),
        finalize(() => {
          // em caso de complete ou error, nós setamos o saving para false
          this.todosState.setSaving(false);
        })
      )
  }

  editTodo(todo: Todo): Observable<Todo> {
    // Descomente para simular uma resposta "otimista"
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
    // this.todosState.removeTodo(todo.id);
    this.todosState.setTodoBeingSaved(todo.id)
    return this.todosApi.deleteTodo(todo)
      .pipe(
        tap(() => {
          // aqui podemos remover o todo da nossa lista pelo ID, sem precisar fazer uma busca nos items do backend novamente
          this.todosState.removeTodo(todo.id);
        }),
        finalize(() => {
          this.todosState.setTodoNotBeingSaved(todo.id)
        })
      );
  }

  /**
   * Atualiza os filtros atuais
   */
  updateTodosFilters(filters: TodoFilters) {
    this.todosState.setFilters(filters);
  }
}

/**
 * Ordena os todos por favoritos
 */
export function orderTodosByFavorites(todos: TodoListItem[]): TodoListItem[] {
  // utilizamos o slice aqui para duplicar o array, evitando de modificarmos o array original
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

