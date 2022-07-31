import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { debounceTime, map, takeUntil } from 'rxjs/operators';
import { TodoFilters } from 'src/app/shared/core/state/todos-state.service';
import { TodosFacadeService } from 'src/app/shared/facade/todos-facade.service';
import { Todo } from 'src/app/shared/types/todo.type';
import { v4 } from 'uuid';

@Component({
  templateUrl: './todos-page.component.html',
  styleUrls: ['./todos-page.component.scss']
})
export class TodosPageComponent implements OnInit, OnDestroy {

  filteredTodos$ = this.todosFacade.orderedTodos$;
  loading$ = this.todosFacade.loading$;

  filterForm = new FormGroup({
    title: new FormControl<string | null>(null),
    isCompleted: new FormControl<boolean | null>(null),
  });

  newTodoControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(3)]
  });

  saving$ = this.todosFacade.saving$;
  isSaving: boolean = false;

  todosCount$ = this.todosFacade.todosCount$;
  todosCompletedCount$ = this.todosFacade.todosCompletedCount$;

  destroy$ = new Subject<void>();

  constructor(private todosFacade: TodosFacadeService) {}

  ngOnInit(): void {
    // Esse é um observable infinito, então usamos o takeUntil com destroy$ para que possamos completar
    // o observable quando esse componente for destruido para evitarmos vazamento de memória.
    this.saving$.pipe(
      takeUntil(this.destroy$)
    )
    .subscribe({
      next: (isSaving) => {
        // armazenamos o saving em uma propriedade primitiva para evitarmos 
        // ter que fazer subscribe repetidas vezes no template.
        this.isSaving = isSaving
      }
    })
    this.todosFacade.loadTodos().subscribe();
    this.filterForm
      .valueChanges
      .pipe(
        debounceTime(300),
        // using rawValue to remove undefined values from form
        map(() => this.filterForm.getRawValue()),
        takeUntil(this.destroy$)
      )
      .subscribe(filters => {
        this.todosFacade.updateTodosFilters(filters);
      })
  }

  onTodoDeleted(todo: Todo) {
    this.todosFacade.deleteTodo(todo)
      .subscribe();
  }

  onTodoToggled(todo: Todo) {
    this.todosFacade.editTodo({
      ...todo,
      isCompleted: !todo.isCompleted,
    })
      .subscribe({
        next: () => {
          console.log('todo toggled',)
        },
        error: (error) => {
          console.error(error);
        }
      });
  }

  onTodoToggledFavorite(todo: Todo) {
    this.todosFacade.editTodo({
      ...todo,
      isFavorited: !todo.isFavorited,
    })
      .subscribe({
        next: () => {
          console.log('todo toggled isFavorited',)
        },
        error: (error) => {
          console.error(error);
        }
      });
  }

  createTodo() {
    this.todosFacade.addTodo({
      // v4 é uma função para gerar um GUID versão 4, que é um identificador único
      id: v4(),
      title: this.newTodoControl.value,
      isCompleted: false,
      isFavorited: false,
    })
      .subscribe({
        next: () => console.log('Todo criado'),
        error: (error) => console.log(`erro: ${error}`),
      });
  }

  ngOnDestroy(): void {
    // notificamos que o componente foi destruido
    this.destroy$.next();
    this.destroy$.complete();
  }

}
