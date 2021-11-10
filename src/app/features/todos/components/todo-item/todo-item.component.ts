import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter, HostBinding } from '@angular/core';
import { Todo } from 'src/app/shared/types/todo.type';

@Component({
  selector: 'app-todo-item',
  templateUrl: './todo-item.component.html',
  styleUrls: ['./todo-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodoItemComponent implements OnInit {

  @Input()
  todo!: Todo;

  @Output()
  toggleStatus = new EventEmitter<Todo>();

  @Output()
  delete = new EventEmitter<Todo>();

  constructor() { }

  ngOnInit(): void {
  }

  onToggleClicked() {
    this.toggleStatus.emit(this.todo);
  }

  onDeleteClicked() {
    this.delete.emit(this.todo);
  }

}
