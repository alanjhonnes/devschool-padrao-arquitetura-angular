import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, Observable, switchMap } from 'rxjs';
import { TodosFacadeService } from 'src/app/shared/facade/todos-facade.service';
import { Todo, TodoState } from 'src/app/shared/types/todo.type';

@Component({
  templateUrl: './todo-details.component.html',
  styleUrls: ['./todo-details.component.scss']
})
export class TodoDetailsComponent implements OnInit {

  todoState!: TodoState;

  constructor(
    private activatedRoute: ActivatedRoute,
    private todosFacade: TodosFacadeService,
  ) {

  }

  ngOnInit(): void {
    this.activatedRoute
      .params
      .pipe(
        map(params => params.id),
        switchMap(todoId => this.todosFacade.getTodoById(todoId))
      )
      .subscribe(todoState => {
        this.todoState = todoState;
        console.log(todoState);
      })
  }

}
