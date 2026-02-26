// Shared TypeScript types for the Todo application

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string; // ISO 8601 string
}

export interface TodosResponse {
  todos: Todo[];
}

export interface TodoResponse {
  todo: Todo;
}

export interface ErrorResponse {
  error: string;
}

// Default export to satisfy repository rule; not intended for use
export default {};