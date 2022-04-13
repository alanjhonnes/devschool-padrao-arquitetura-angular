import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Todo, TodoListItem } from 'src/app/shared/types/todo.type';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodoListComponent implements OnInit {

  @Input()
  todos!: TodoListItem[];

  @Output()
  todoToggle = new EventEmitter<Todo>();

  @Output()
  todoToggleFavorite = new EventEmitter<Todo>();

  @Output()
  todoDelete = new EventEmitter<Todo>();

  constructor() { }

  ngOnInit(): void {
  }

  onTodoToggledFavorite(todo: Todo) {
    this.todoToggleFavorite.emit(todo);
  }

  onTodoToggled(todo: Todo) {
    this.todoToggle.emit(todo);
  }

  onTodoDeleted(todo: Todo) {
    this.todoDelete.emit(todo);
  }

}
