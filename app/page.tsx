import { serverClient } from './_trpc/serverClient';

import TodoList from './_components/TodoList';

export default async function Home() {
  const todos = await serverClient.todo.getTodos();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <TodoList initialTodos={todos} />
    </main>
  );
}
