import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter, HostBinding } from '@angular/core';
import { Todo, TodoListItem } from 'src/app/shared/types/todo.type';

@Component({
  selector: 'app-todo-item',
  templateUrl: './todo-item.component.html',
  styleUrls: ['./todo-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodoItemComponent implements OnInit {

  @Input()
  todo!: TodoListItem;

  @Output()
  toggleStatus = new EventEmitter<Todo>();

  @Output()
  toggleFavorite = new EventEmitter<Todo>();

  @Output()
  delete = new EventEmitter<Todo>();

  constructor() { }

  ngOnInit(): void {
  }

  onToggleClicked() {
    this.toggleStatus.emit(this.todo);
  }

  onToggleFavorite() {
    this.toggleFavorite.emit(this.todo);
  }

  onDeleteClicked() {
    this.delete.emit(this.todo);
  }

}
