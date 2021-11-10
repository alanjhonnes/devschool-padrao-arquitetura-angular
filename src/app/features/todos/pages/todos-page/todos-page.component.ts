import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { TodosFacadeService } from 'src/app/shared/facade/todos-facade.service';
import { Todo } from 'src/app/shared/types/todo.type';

@Component({
  templateUrl: './todos-page.component.html',
  styleUrls: ['./todos-page.component.scss']
})
export class TodosPageComponent implements OnInit {

  filteredTodos$: Observable<Todo[]> = this.todosFacade.filteredTodos$;
  loading$ = this.todosFacade.loading$;

  filterForm = new FormGroup({
    title: new FormControl(''),
    isCompleted: new FormControl(null),
  });



  constructor(private todosFacade: TodosFacadeService) { }

  ngOnInit(): void {
    this.todosFacade.loadTodos().subscribe();
    this.filterForm
      .valueChanges
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
    .subscribe();
  }

}
