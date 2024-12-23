import type React from 'react';
import { useState } from 'react';

interface Todo {
    id: string;
    text: string;
    completed: boolean;
}

interface TodoListProps {
    initialTodos?: Todo[];
    onTodoChange?: (todos: Todo[]) => void;
}

/**
 *
 * 할 일 입력 폼 (입력창 + 추가 버튼) => 완료
 * 할 일 목록 표시 => 완료
 * 각 할 일 항목에 대한 완료 체크박스 => 완료
 * 삭제 버튼 => 완료
 * 수정 기능
 * 필터링 기능 (전체/진행중/완료)
 * 전체 선택/해제 버튼
 * 남은 할 일 개수 표시
 * 할 일 순서 변경 기능
 *
 **/

const TodoList: React.FC<TodoListProps> = ({ initialTodos = [], onTodoChange }) => {
    const [todos, setTodos] = useState<Todo[]>(initialTodos);
    const [newTodoText, setNewTodoText] = useState<string>('');

    const handleAddTodo = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!newTodoText.trim()) {
            return;
        }
        const newTodo: Todo = {
            id: new Date().getTime().toString(),
            text: newTodoText,
            completed: false,
        };
        setTodos((prevTodos) => [...prevTodos, newTodo]);
        setNewTodoText('');
        onTodoChange?.([...todos, newTodo]);
    };

    const handleToggleTodo = (id: string) => {
        setTodos((prevTodos) =>
            prevTodos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)),
        );
    };

    const handleDeleteTodo = (id: string) => {
        const updatedTodos = todos.filter((todo) => todo.id !== id);
        setTodos(updatedTodos);
        onTodoChange?.(updatedTodos);
    };

    return (
        <div className="max-w-2xl mx-auto p-4 space-y-4">
            <form className="flex gap-2" onSubmit={handleAddTodo}>
                <input
                    type="text"
                    aria-label="할 일 입력"
                    placeholder="새로운 할 일을 입력하세요"
                    value={newTodoText}
                    onChange={(e) => setNewTodoText(e.target.value)}
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="submit"
                    aria-label="추가"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    추가
                </button>
            </form>

            <ul role="list" className="space-y-2">
                {todos.map((todo) => (
                    <li key={todo.id} className="flex items-center justify-between gap-2 p-2 border rounded-lg">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={todo.completed}
                                onChange={() => handleToggleTodo(todo.id)}
                                className="w-5 h-5 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                                aria-label={`${todo.text} 완료 여부`}
                            />
                            <span className={todo.completed ? 'line-through text-gray-500' : ''}>{todo.text}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleDeleteTodo(todo.id)}
                            aria-label="삭제"
                            className="px-3 py-1 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            삭제
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};
export default TodoList;
