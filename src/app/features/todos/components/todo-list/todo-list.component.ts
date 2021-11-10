import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Todo } from 'src/app/shared/types/todo.type';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodoListComponent implements OnInit {

  @Input()
  todos!: Todo[];

  @Output()
  todoToggle = new EventEmitter<Todo>();

  @Output()
  todoDelete = new EventEmitter<Todo>();

  constructor() { }

  ngOnInit(): void {
  }

  onTodoToggled(todo: Todo) {
    this.todoToggle.emit(todo);
  }

  onTodoDeleted(todo: Todo) {
    this.todoDelete.emit(todo);
  }

}
