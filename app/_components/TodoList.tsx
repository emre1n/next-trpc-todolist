'use client';
import { useState } from 'react';

import { trpc } from '../_trpc/client';

export default function TodoList() {
  const getTodos = trpc.todo.getTodos.useQuery();
  const addTodo = trpc.todo.addTodo.useMutation({
    onSettled: () => {
      getTodos.refetch();
    },
  });

  const [content, setContent] = useState('');

  return (
    <div className="flex flex-col gap-8">
      <ul>
        {getTodos?.data?.map(todo => (
          <li className="flex list-none gap-2" key={todo.id}>
            <input
              id={`check-${todo.id}`}
              type="checkbox"
              checked={!!todo.done}
              onChange={async () => {
                // setDone.mutate({
                //   id: todo.id,
                //   done: todo.done ? 0 : 1,
                // });
              }}
            />
            <label htmlFor={`check-${todo.id}`}>{todo.content}</label>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-4">
        <label htmlFor="content">Content</label>
        <input
          type="text"
          id="content"
          value={content}
          onChange={e => setContent(e.target.value)}
          className="p-2 text-black border border-gray-600 rounded-lg outline-none"
        />
        <button
          className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700"
          onClick={async () => {
            if (content.length) {
              addTodo.mutate(content);
              setContent('');
            }
          }}
        >
          Add Todo
        </button>
      </div>
    </div>
  );
}
