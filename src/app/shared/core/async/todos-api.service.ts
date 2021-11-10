import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable, of } from 'rxjs';
import { Todo } from '../../types/todo.type';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TodosApiService {

  readonly apiPath = `${environment.apiPath}/todos`;

  constructor(private http: HttpClient) { }

  getTodos(): Observable<Todo[]> {
    return this.http.get<Todo[]>(this.apiPath);
  }

  createTodo(todo: Todo) {
    return this.http.post<Todo>(this.apiPath, todo);
  }

  editTodo(todo: Todo) {
    return this.http.put<Todo>(`${this.apiPath}/${todo.id}`, todo);
  }

  deleteTodo(todo: Todo) {
    return this.http.delete<Todo>(`${this.apiPath}/${todo.id}`);
  }
}
