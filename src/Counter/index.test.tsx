import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Counter from '.';

describe('Counter 컴포넌트 기본 기능', () => {
    it('카운터가 초기값 0으로 렌더링되어야 한다', () => {
        render(<Counter />);
        expect(screen.getByTestId('count-display')).toHaveTextContent('0');
    });

    it('증가 버튼 클릭시 기본 step 값(1)만큼 증가해야 한다', async () => {
        render(<Counter />);
        await userEvent.click(screen.getByTestId('increment-button'));
        expect(screen.getByTestId('count-display')).toHaveTextContent('1');
    });

    it('리셋 버튼 클릭시 초기값으로 돌아가야 한다', async () => {
        render(<Counter />);
        await userEvent.click(screen.getByTestId('increment-button'));
        await userEvent.click(screen.getByTestId('reset-button'));
        expect(screen.getByTestId('count-display')).toHaveTextContent('0');
    });
    it('커스텀 초기값이 정상적으로 적용되어야 한다', async () => {
        render(<Counter initialValue={5} />);
        const countDisplay = screen.getByTestId('count-display');
        expect(countDisplay).toHaveTextContent('5');
        const historyDisplay = screen.getByTestId('history-display');
        expect(historyDisplay).toHaveTextContent('최근 기록: 5');
    });
    it('설정된 step 값만큼 증가/감소해야 한다', async () => {
        render(<Counter step={2} />);
        await userEvent.click(screen.getByTestId('increment-button'));
        expect(screen.getByTestId('count-display')).toHaveTextContent('2');
        await userEvent.click(screen.getByTestId('decrement-button'));
        expect(screen.getByTestId('count-display')).toHaveTextContent('0');
    });
    it('최대값에 도달하면 증가 버튼이 비활성화되어야 한다', async () => {
        render(<Counter maxValue={5} step={5} />);
        await userEvent.click(screen.getByTestId('increment-button'));
        expect(screen.getByTestId('count-display')).toHaveTextContent('5');
        expect(screen.getByTestId('increment-button')).toBeDisabled();
    });
    it('최소값에 도달하면 감소 버튼이 비활성화되어야 한다', async () => {
        render(<Counter initialValue={10} minValue={5} step={5} />);
        await userEvent.click(screen.getByTestId('decrement-button'));
        expect(screen.getByTestId('count-display')).toHaveTextContent('5');
        expect(screen.getByTestId('decrement-button')).toBeDisabled();
    });
    it('값이 변경될 때마다 onCountChange 콜백이 호출되어야 한다', async () => {
        const user = userEvent.setup();
        const onCountChange = jest.fn();
        render(<Counter onCountChange={onCountChange} />);

        await user.click(screen.getByTestId('increment-button'));
        expect(onCountChange).toHaveBeenCalledTimes(1);
        expect(onCountChange).toHaveBeenCalledWith(1);

        await user.click(screen.getByTestId('decrement-button'));
        expect(onCountChange).toHaveBeenCalledTimes(2);
        expect(onCountChange).toHaveBeenCalledWith(0);
    });
    it('최대값 도달 시 onMaxReached 콜백이 호출되어야 한다', async () => {
        const user = userEvent.setup();
        const onMaxReached = jest.fn();

        render(<Counter maxValue={1} onMaxReached={onMaxReached} />);
        await user.click(screen.getByTestId('increment-button'));
        expect(onMaxReached).toHaveBeenCalledTimes(1);
    });
    it('실행 취소 버튼 클릭 시 이전 값으로 돌아가야 한다', async () => {
        render(<Counter />);
        await userEvent.click(screen.getByTestId('increment-button'));
        await userEvent.click(screen.getByTestId('undo-button'));
        expect(screen.getByTestId('count-display')).toHaveTextContent('0');
    });
    it('최근 3개의 값이 히스토리에 표시되어야 한다', async () => {
        render(<Counter />);
        await userEvent.click(screen.getByTestId('increment-button'));
        await userEvent.click(screen.getByTestId('increment-button'));
        await userEvent.click(screen.getByTestId('decrement-button'));
        const historyDisplay = screen.getByTestId('history-display');
        expect(historyDisplay).toHaveTextContent('최근 기록: 1, 2, 1');
    });
    it('여러 번의 증가/감소 후 실행 취소가 정상적으로 동작해야 한다', async () => {
        const user = userEvent.setup();
        render(<Counter />);
        const countDisplay = screen.getByTestId('count-display');
        const historyDisplay = screen.getByTestId('history-display');

        expect(countDisplay).toHaveTextContent('0');
        expect(historyDisplay).toHaveTextContent('최근 기록: 0');

        await user.click(screen.getByTestId('increment-button'));
        expect(countDisplay).toHaveTextContent('1');
        expect(historyDisplay).toHaveTextContent('최근 기록: 0, 1');

        await user.click(screen.getByTestId('increment-button'));
        expect(countDisplay).toHaveTextContent('2');
        expect(historyDisplay).toHaveTextContent('최근 기록: 0, 1, 2');

        await user.click(screen.getByTestId('decrement-button'));
        expect(countDisplay).toHaveTextContent('1');
        expect(historyDisplay).toHaveTextContent('최근 기록: 1, 2, 1');

        await user.click(screen.getByTestId('undo-button'));
        expect(countDisplay).toHaveTextContent('2');
        expect(historyDisplay).toHaveTextContent('최근 기록: 0, 1, 2');
    });
});

describe('Counter 컴포넌트 UI 테스트', () => {
    it('제목이 "카운터"로 표시되어야 한다', () => {
        const { getByText } = render(<Counter />);
        expect(getByText('카운터')).toBeInTheDocument();
    });

    it('숫자를 표시하는 영역이 있어야 한다', () => {
        const { getByTestId } = render(<Counter />);
        expect(getByTestId('count-display')).toBeInTheDocument();
    });

    it('버튼 그룹이 순서대로 [감소-증가-리셋-실행취소] 버튼을 포함해야 한다', () => {
        const { getAllByRole } = render(<Counter />);
        const buttons = getAllByRole('button');
        expect(buttons[0]).toHaveTextContent('감소');
        expect(buttons[1]).toHaveTextContent('증가');
        expect(buttons[2]).toHaveTextContent('리셋');
        expect(buttons[3]).toHaveTextContent('실행 취소');
    });

    it('증가/감소 버튼에는 step 값이 표시되어야 한다', () => {
        const { getAllByRole } = render(<Counter step={5} />);
        const buttons = getAllByRole('button');
        expect(buttons[0]).toHaveTextContent('5만큼 감소');
        expect(buttons[1]).toHaveTextContent('5만큼 증가');
    });

    it('히스토리 영역에는 "최근 기록: "이라는 텍스트가 포함되어야 한다', () => {
        const { getByTestId } = render(<Counter />);
        expect(getByTestId('history-display')).toHaveTextContent('최근 기록: ');
    });

    describe('버튼 스타일', () => {
        it('모든 버튼은 동일한 크기여야 한다', () => {
            const { getAllByRole } = render(<Counter />);
            const buttons = getAllByRole('button');

            const sizeClasses = ['px-4', 'py-2'];
            buttons.forEach((button) => {
                sizeClasses.forEach((className) => {
                    expect(button.className).toContain(className);
                });
            });
        });

        it('비활성화된 버튼은 시각적으로 구분되어야 한다', () => {
            render(<Counter initialValue={0} minValue={0} maxValue={1} />);

            const decrementButton = screen.getByTestId('decrement-button');
            const incrementButton = screen.getByTestId('increment-button');
            const resetButton = screen.getByTestId('reset-button');
            const undoButton = screen.getByTestId('undo-button');

            expect(decrementButton).toBeDisabled();
            expect(undoButton).toBeDisabled();

            expect(decrementButton).toHaveClass('disabled:opacity-10', 'disabled:cursor-not-allowed');
            expect(undoButton).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');

            expect(incrementButton).not.toBeDisabled();
            expect(resetButton).not.toBeDisabled();

            expect(incrementButton).toHaveClass('bg-green-500', 'hover:bg-green-600');
            expect(resetButton).toHaveClass('bg-gray-500', 'hover:bg-gray-600');
        });
    });

    describe('숫자 표시 영역', () => {
        it('숫자는 중앙 정렬되어야 한다', () => {
            const { getByTestId } = render(<Counter />);
            const countDisplay = getByTestId('count-display');
            expect(countDisplay).toHaveClass('flex', 'items-center', 'justify-center');
        });
    });

    describe('히스토리 표시', () => {
        it('히스토리는 쉼표로 구분되어 표시되어야 한다', async () => {
            const user = userEvent.setup();
            render(<Counter />);
            const historyDisplay = screen.getByTestId('history-display');

            expect(historyDisplay).toHaveTextContent('최근 기록: 0');

            await user.click(screen.getByTestId('increment-button'));
            expect(historyDisplay).toHaveTextContent('최근 기록: 0, 1');

            await user.click(screen.getByTestId('increment-button'));
            expect(historyDisplay).toHaveTextContent('최근 기록: 0, 1, 2');

            await user.click(screen.getByTestId('decrement-button'));
            expect(historyDisplay).toHaveTextContent('최근 기록: 1, 2, 1');
        });

        it('실행 취소 시 히스토리도 함께 업데이트되어야 한다', async () => {
            const user = userEvent.setup();
            render(<Counter />);
            const historyDisplay = screen.getByTestId('history-display');

            await user.click(screen.getByTestId('increment-button'));
            await user.click(screen.getByTestId('increment-button'));
            await user.click(screen.getByTestId('undo-button'));

            expect(historyDisplay).toHaveTextContent('최근 기록: 0, 1');
        });
    });
});
