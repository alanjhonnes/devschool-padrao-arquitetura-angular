import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { TodoFilters } from 'src/app/shared/core/state/todos-state.service';
import { TodosFacadeService } from 'src/app/shared/facade/todos-facade.service';
import { Todo } from 'src/app/shared/types/todo.type';
import { v4 } from 'uuid';

@Component({
  templateUrl: './todos-page.component.html',
  styleUrls: ['./todos-page.component.scss']
})
export class TodosPageComponent implements OnInit {

  filteredTodos$ = this.todosFacade.orderedTodos$;
  loading$ = this.todosFacade.loading$;

  filterForm = new FormGroup({
    title: new FormControl<string | null>(''),
    isCompleted: new FormControl<boolean | null>(null),
  });

  newTodoControl = new FormControl();

  saving$ = this.todosFacade.saving$;

  todosCount$ = this.todosFacade.todosCount$;
  todosCompletedCount$ = this.todosFacade.todosCompletedCount$;

  constructor(private todosFacade: TodosFacadeService) { }

  ngOnInit(): void {
    this.todosFacade.loadTodos().subscribe();
    this.filterForm
      .valueChanges
      .pipe(
        debounceTime(500),
        // using rawValue to remove undefined values from form
        map(() => this.filterForm.getRawValue())
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

}
