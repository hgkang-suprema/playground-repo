// Shared types for the Todo app. No default export.

/** Single todo item shape stored on the server and used in UI */
export interface Todo {
  id: string; // UUID string
  title: string; // Todo text
  completed: boolean; // Completion status
  createdAt: string; // ISO 8601 timestamp
}

/** POST /api/todos */
export interface CreateTodoRequest {
  title: string;
}

/** PATCH /api/todos */
export interface UpdateTodoRequest {
  id: string;
  title?: string;
  completed?: boolean;
}

/** DELETE /api/todos */
export interface DeleteTodoRequest {
  id: string;
}

/** Generic error envelope returned by API on failure */
export interface ApiError {
  error: string;
}
