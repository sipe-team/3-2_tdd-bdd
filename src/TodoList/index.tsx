import type React from 'react';
import { useState } from 'react';

interface Todo {
    id: string;
    text: string;
    completpnpmed: boolean;
}

interface TodoListProps {
    initialTodos?: Todo[];
    onTodoChange?: (todos: Todo[]) => void;
}

/**
 *
 * 할 일 입력 폼 (입력창 + 추가 버튼) => 완료
 * 할 일 목록 표시
 * 각 할 일 항목에 대한 완료 체크박스
 * 삭제 버튼
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

    return (
        <div className="max-w-2xl mx-auto p-4 space-y-4">
            <form
                className="flex gap-2"
                onSubmit={(e) => {
                    e.preventDefault();
                }}
            >
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
        </div>
    );
};
export default TodoList;
