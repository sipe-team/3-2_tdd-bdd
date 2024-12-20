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
 * 할 일 입력 폼 (입력창 + 추가 버튼)
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

const TodoList = () => {
    return <div>TodoList</div>;
};
export default TodoList;
