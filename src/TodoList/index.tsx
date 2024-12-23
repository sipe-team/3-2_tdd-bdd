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

type FilterType = 'all' | 'active' | 'completed';

/**
 *
 * 할 일 입력 폼 (입력창 + 추가 버튼) => 완료
 * 할 일 목록 표시 => 완료
 * 각 할 일 항목에 대한 완료 체크박스 => 완료
 * 삭제 버튼 => 완료
 * 수정 기능 => 완료
 * 필터링 기능 (전체/진행중/완료) => 완료
 * 전체 선택/해제 버튼 => 완료
 * 남은 할 일 개수 표시 => 완료
 * 할 일 순서 변경 기능
 *
 **/

const TodoList: React.FC<TodoListProps> = ({ initialTodos = [], onTodoChange }) => {
    const [todos, setTodos] = useState<Todo[]>(initialTodos);
    const [newTodoText, setNewTodoText] = useState<string>('');
    const [filter, setFilter] = useState<FilterType>('all');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');

    const activeTodosCount = todos.filter((todo) => !todo.completed).length;
    const hasAnyTodos = todos.length > 0;

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
        const updatedTodos = todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo));
        setTodos(updatedTodos);
        onTodoChange?.(updatedTodos);
    };

    const handleToggleAll = () => {
        const allCompleted = todos.every((todo) => todo.completed);
        const updatedTodos = todos.map((todo) => ({
            ...todo,
            completed: !allCompleted,
        }));
        setTodos(updatedTodos);
        onTodoChange?.(updatedTodos);
    };

    const handleDeleteTodo = (id: string) => {
        const updatedTodos = todos.filter((todo) => todo.id !== id);
        setTodos(updatedTodos);
        onTodoChange?.(updatedTodos);
    };

    const startEditing = (todo: Todo) => {
        setEditingId(todo.id);
        setEditText(todo.text);
    };

    const handleEditTodo = (id: string) => {
        if (!editText.trim()) return;

        const updatedTodos = todos.map((todo) => (todo.id === id ? { ...todo, text: editText.trim() } : todo));
        setTodos(updatedTodos);
        setEditingId(null);
        setEditText('');
        onTodoChange?.(updatedTodos);
    };

    const filteredTodos = todos.filter((todo) => {
        if (filter === 'active') return !todo.completed;
        if (filter === 'completed') return todo.completed;
        return true;
    });

    return (
        <div className="max-w-2xl mx-auto p-4 space-y-4">
            <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">남은 할 일: {activeTodosCount}개</div>
                {hasAnyTodos && (
                    <button
                        type="button"
                        onClick={handleToggleAll}
                        aria-label="전체 선택"
                        className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        {todos.every((todo) => todo.completed) ? '전체 해제' : '전체 선택'}
                    </button>
                )}
            </div>

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

            <div className="flex gap-4 p-2 bg-gray-50 rounded-lg">
                <label className="flex items-center gap-2">
                    <input
                        type="radio"
                        name="filter"
                        checked={filter === 'all'}
                        onChange={() => setFilter('all')}
                        className="text-blue-500 focus:ring-blue-500"
                    />
                    <span>전체</span>
                </label>
                <label className="flex items-center gap-2">
                    <input
                        type="radio"
                        name="filter"
                        checked={filter === 'active'}
                        onChange={() => setFilter('active')}
                        className="text-blue-500 focus:ring-blue-500"
                    />
                    <span>진행중</span>
                </label>
                <label className="flex items-center gap-2">
                    <input
                        type="radio"
                        name="filter"
                        checked={filter === 'completed'}
                        onChange={() => setFilter('completed')}
                        className="text-blue-500 focus:ring-blue-500"
                    />
                    <span>완료된 할 일</span>
                </label>
            </div>

            <ul role="list" className="space-y-2">
                {filteredTodos.map((todo) => (
                    <li key={todo.id} className="flex items-center justify-between gap-2 p-2 border rounded-lg">
                        <div className="flex items-center gap-2 flex-1">
                            <input
                                type="checkbox"
                                checked={todo.completed}
                                onChange={() => handleToggleTodo(todo.id)}
                                className="w-5 h-5 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                                aria-label={`${todo.text} 완료 여부`}
                            />
                            {editingId === todo.id ? (
                                <input
                                    type="text"
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    className="flex-1 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    aria-label="할 일 수정"
                                />
                            ) : (
                                <span className={todo.completed ? 'line-through text-gray-500' : ''}>{todo.text}</span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            {editingId === todo.id ? (
                                <button
                                    type="button"
                                    onClick={() => handleEditTodo(todo.id)}
                                    aria-label="저장"
                                    className="px-3 py-1 text-sm text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    저장
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => startEditing(todo)}
                                    aria-label="수정"
                                    className="px-3 py-1 text-sm text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    수정
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => handleDeleteTodo(todo.id)}
                                aria-label="삭제"
                                className="px-3 py-1 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                삭제
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};
export default TodoList;
