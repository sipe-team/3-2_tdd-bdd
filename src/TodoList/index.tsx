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

const TodoList: React.FC<TodoListProps> = ({ initialTodos = [], onTodoChange }) => {
    const [todos, setTodos] = useState<Todo[]>(initialTodos);
    const [newTodoText, setNewTodoText] = useState('');
    const [filter, setFilter] = useState<FilterType>('all');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');
    const [error, setError] = useState<string>('');

    const handleAddTodo = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const trimmedText = newTodoText.trim();
        if (!trimmedText) {
            return;
        }

        if (todos.some((todo) => todo.text === trimmedText)) {
            setError('이미 존재하는 할 일입니다.');
            return;
        }

        const newTodo: Todo = {
            id: Date.now().toString(),
            text: trimmedText,
            completed: false,
        };

        const updatedTodos = [...todos, newTodo];
        setTodos(updatedTodos);
        setNewTodoText('');
        onTodoChange?.(updatedTodos);
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

        if (todos.some((todo) => todo.id !== id && todo.text === editText.trim())) {
            setError('이미 존재하는 할 일입니다.');
            return;
        }

        const updatedTodos = todos.map((todo) => (todo.id === id ? { ...todo, text: editText.trim() } : todo));
        setTodos(updatedTodos);
        setEditingId(null);
        setEditText('');
        onTodoChange?.(updatedTodos);
    };

    const moveTodo = (id: string, direction: 'up' | 'down') => {
        const index = todos.findIndex((todo) => todo.id === id);
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === todos.length - 1)) {
            return;
        }

        const newIndex = direction === 'up' ? index - 1 : index + 1;
        const updatedTodos = [...todos];
        [updatedTodos[index], updatedTodos[newIndex]] = [updatedTodos[newIndex], updatedTodos[index]];

        setTodos(updatedTodos);
        onTodoChange?.(updatedTodos);
    };

    const activeTodosCount = todos.filter((todo) => !todo.completed).length;
    const hasAnyTodos = todos.length > 0;

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

            {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg">{error}</div>
            )}
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
                {filteredTodos.map((todo, index) => (
                    <li key={todo.id} className="flex items-center justify-between gap-2 p-2 border rounded-lg">
                        <div className="flex items-center gap-2 flex-1">
                            <div className="flex flex-col gap-1">
                                <button
                                    type="button"
                                    onClick={() => moveTodo(todo.id, 'up')}
                                    aria-label="위로"
                                    disabled={index === 0}
                                    className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                >
                                    ▲
                                </button>
                                <button
                                    type="button"
                                    onClick={() => moveTodo(todo.id, 'down')}
                                    aria-label="아래로"
                                    disabled={index === filteredTodos.length - 1}
                                    className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                >
                                    ▼
                                </button>
                            </div>
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
