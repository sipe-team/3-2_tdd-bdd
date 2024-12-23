// src/components/TodoList/index.test.tsx
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoList from '.';

describe('TodoList 컴포넌트', () => {
    it('새로운 할 일을 입력할 수 있는 폼이 렌더링되어야 한다', () => {
        render(<TodoList />);
        expect(screen.getByRole('textbox', { name: /할 일 입력/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /추가/i })).toBeInTheDocument();
    });

    it('새로운 할 일을 추가할 수 있어야 한다', async () => {
        render(<TodoList />);
        const input = screen.getByRole('textbox', { name: /할 일 입력/i });
        const addButton = screen.getByRole('button', { name: /추가/i });

        await userEvent.type(input, '리액트 공부하기');
        await userEvent.click(addButton);

        const todoList = screen.getByRole('list');
        expect(within(todoList).getByText('리액트 공부하기')).toBeInTheDocument();
    });

    it('빈 문자열은 추가할 수 없어야 한다', async () => {
        render(<TodoList />);
        const addButton = screen.getByRole('button', { name: /추가/i });

        await userEvent.click(addButton);
        const todoList = screen.getByRole('list');
        expect(todoList.children.length).toBe(0);
    });

    it('할 일의 완료 상태를 토글할 수 있어야 한다', async () => {
        render(<TodoList />);
        const input = screen.getByRole('textbox', { name: /할 일 입력/i });
        const addButton = screen.getByRole('button', { name: /추가/i });

        await userEvent.type(input, '리액트 공부하기');
        await userEvent.click(addButton);

        const checkbox = screen.getByRole('checkbox');
        await userEvent.click(checkbox);
        expect(checkbox).toBeChecked();
    });

    it('할 일을 삭제할 수 있어야 한다', async () => {
        render(<TodoList />);
        const input = screen.getByRole('textbox', { name: /할 일 입력/i });
        const addButton = screen.getByRole('button', { name: /추가/i });

        await userEvent.type(input, '리액트 공부하기');
        await userEvent.click(addButton);

        const deleteButton = screen.getByRole('button', { name: /삭제/i });
        await userEvent.click(deleteButton);

        expect(screen.queryByText('리액트 공부하기')).not.toBeInTheDocument();
    });

    it('완료된 할 일만 필터링할 수 있어야 한다', async () => {
        render(<TodoList />);
        const input = screen.getByRole('textbox', { name: /할 일 입력/i });
        const addButton = screen.getByRole('button', { name: /추가/i });

        await userEvent.type(input, '리액트 공부하기');
        await userEvent.click(addButton);
        await userEvent.clear(input);
        await userEvent.type(input, '운동하기');
        await userEvent.click(addButton);

        const checkboxes = screen.getAllByRole('checkbox');
        await userEvent.click(checkboxes[0]);

        const completedFilter = screen.getByRole('radio', { name: /완료된 할 일/i });
        await userEvent.click(completedFilter);

        expect(screen.getByText('리액트 공부하기')).toBeInTheDocument();
        expect(screen.queryByText('운동하기')).not.toBeInTheDocument();
    });

    it('할 일의 내용을 수정할 수 있어야 한다', async () => {
        render(<TodoList />);
        const input = screen.getByRole('textbox', { name: /할 일 입력/i });
        const addButton = screen.getByRole('button', { name: /추가/i });

        await userEvent.type(input, '리액트 공부하기');
        await userEvent.click(addButton);

        const editButton = screen.getByRole('button', { name: /수정/i });
        await userEvent.click(editButton);

        const editInput = screen.getByRole('textbox', { name: /할 일 수정/i });
        await userEvent.clear(editInput);
        await userEvent.type(editInput, '리액트 마스터하기');

        const saveButton = screen.getByRole('button', { name: /저장/i });
        await userEvent.click(saveButton);

        expect(screen.getByText('리액트 마스터하기')).toBeInTheDocument();
    });

    it('모든 할 일을 한 번에 완료/미완료로 표시할 수 있어야 한다', async () => {
        render(<TodoList />);
        const input = screen.getByRole('textbox', { name: /할 일 입력/i });
        const addButton = screen.getByRole('button', { name: /추가/i });

        const todos = ['리액트 공부하기', '운동하기', '책 읽기'];
        for (const todo of todos) {
            await userEvent.clear(input);
            await userEvent.type(input, todo);
            await userEvent.click(addButton);
        }

        const toggleAllButton = screen.getByRole('button', { name: /전체 선택/i });
        await userEvent.click(toggleAllButton);

        const checkboxes = screen.getAllByRole('checkbox');
        checkboxes.forEach((checkbox) => {
            expect(checkbox).toBeChecked();
        });
    });

    it('남은 할 일 개수가 올바르게 표시되어야 한다', async () => {
        render(<TodoList />);
        const input = screen.getByRole('textbox', { name: /할 일 입력/i });
        const addButton = screen.getByRole('button', { name: /추가/i });

        await userEvent.type(input, '리액트 공부하기');
        await userEvent.click(addButton);
        await userEvent.clear(input);
        await userEvent.type(input, '운동하기');
        await userEvent.click(addButton);

        const checkboxes = screen.getAllByRole('checkbox');
        await userEvent.click(checkboxes[0]);

        expect(screen.getByText(/남은 할 일: 1개/i)).toBeInTheDocument();
    });

    it('동일한 내용의 할 일은 추가할 수 없어야 한다', async () => {
        render(<TodoList />);
        const input = screen.getByRole('textbox', { name: /할 일 입력/i });
        const addButton = screen.getByRole('button', { name: /추가/i });

        await userEvent.type(input, '리액트 공부하기');
        await userEvent.click(addButton);
        await userEvent.clear(input);
        await userEvent.type(input, '리액트 공부하기');
        await userEvent.click(addButton);

        const todoList = screen.getByRole('list');
        const items = within(todoList).getAllByText('리액트 공부하기');
        expect(items.length).toBe(1);
    });

    it('할 일의 순서를 변경할 수 있어야 한다', async () => {
        render(<TodoList />);
        const input = screen.getByRole('textbox', { name: /할 일 입력/i });
        const addButton = screen.getByRole('button', { name: /추가/i });

        await userEvent.type(input, '첫 번째 할 일');
        await userEvent.click(addButton);
        await userEvent.clear(input);
        await userEvent.type(input, '두 번째 할 일');
        await userEvent.click(addButton);

        const moveUpButton = screen.getAllByRole('button', { name: /위로/i })[1];
        await userEvent.click(moveUpButton);

        const todoItems = screen.getAllByRole('listitem');
        expect(todoItems[0]).toHaveTextContent('두 번째 할 일');
    });
});
