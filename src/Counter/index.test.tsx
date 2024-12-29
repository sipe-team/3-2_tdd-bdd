import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Counter from '.';

// describe('Counter 컴포넌트 기본 기능', () => {
//     it('카운터가 초기값 0으로 렌더링되어야 한다', () => {
//         render(<Counter />);
//         expect(screen.getByTestId('count-display')).toHaveTextContent('0');
//     });

//     it('증가 버튼 클릭시 기본 step 값(1)만큼 증가해야 한다', async () => {
//         render(<Counter />);
//         await userEvent.click(screen.getByTestId('increment-button'));
//         expect(screen.getByTestId('count-display')).toHaveTextContent('1');
//     });

//     it('리셋 버튼 클릭시 초기값으로 돌아가야 한다', async () => {
//         render(<Counter />);
//         await userEvent.click(screen.getByTestId('increment-button'));
//         await userEvent.click(screen.getByTestId('reset-button'));
//         expect(screen.getByTestId('count-display')).toHaveTextContent('0');
//     });
//     it('커스텀 초기값이 정상적으로 적용되어야 한다', async () => {
//         // 테스트 구현
//     });
//     it('설정된 step 값만큼 증가/감소해야 한다', async () => {
//         // 테스트 구현
//     });
//     it('최대값에 도달하면 증가 버튼이 비활성화되어야 한다', async () => {
//         // 테스트 구현
//     });
//     it('최소값에 도달하면 감소 버튼이 비활성화되어야 한다', async () => {
//         // 테스트 구현
//     });
//     it('값이 변경될 때마다 onCountChange 콜백이 호출되어야 한다', async () => {
//         // 테스트 구현
//     });
//     it('최대값 도달 시 onMaxReached 콜백이 호출되어야 한다', async () => {
//         // 테스트 구현
//     });
//     it('실행 취소 버튼 클릭 시 이전 값으로 돌아가야 한다', async () => {
//         // 테스트 구현
//     });
//     it('최근 3개의 값이 히스토리에 표시되어야 한다', async () => {
//         // 테스트 구현
//     });
//     it('여러 번의 증가/감소 후 실행 취소가 정상적으로 동작해야 한다', async () => {
//         // 테스트 구현
//     });
// });

describe('Counter 컴포넌트 UI 테스트', () => {
    const setup = (props = {}) => {
        const user = userEvent.setup();
        render(<Counter {...props} />);
        
        return {
            user,
            heading: screen.getByRole('heading', { level: 2, name: '카운터' }),
            countDisplay: screen.getByTestId('count-display'),
            buttons: {
                increment: screen.getByTestId('increment-button'),
                decrement: screen.getByTestId('decrement-button'),
                reset: screen.getByTestId('reset-button'),
                undo: screen.getByTestId('undo-button'),
            },
            historyDisplay: screen.getByTestId('history-display'),
            getAllButtons: () => screen.getAllByRole('button'),
        };
    };

    it('제목이 "카운터"로 표시되어야 한다', () => {
        const { heading } = setup();
        expect(heading).toBeInTheDocument();
    });

    it('숫자를 표시하는 영역이 있어야 한다', () => {
        const { countDisplay } = setup();
        expect(countDisplay).toBeInTheDocument();
    });

    it('버튼 그룹이 순서대로 [감소-증가-리셋-실행취소] 버튼을 포함해야 한다', () => {
        // 궁금증 : 두 가지 접근 방식 중 어떤 것이 더 좋은 테스트 방식인가요?
        // 1) button-group이라는 data-testid를 추가하고 within을 사용하여 그 안의 버튼들을 테스트
        // 2) 현재처럼 버튼의 role만으로 테스트
        // (여기는 질문이 있어서 리팩토링을 하지 않았습니다.)
        
        render(<Counter />);
        const buttons = screen.getAllByRole('button');
        
        expect(buttons).toHaveLength(4);
        expect(buttons[0]).toHaveTextContent('감소');
        expect(buttons[1]).toHaveTextContent('증가');
        expect(buttons[2]).toHaveTextContent('리셋');
        expect(buttons[3]).toHaveTextContent('실행 취소');
    });

    it('증가/감소 버튼에는 step 값이 표시되어야 한다', () => {
        const { buttons } = setup({ step: 2 });
        expect(buttons.increment).toHaveTextContent('2만큼 증가');
        expect(buttons.decrement).toHaveTextContent('2만큼 감소');
    });

    it('히스토리 영역에는 "최근 기록: "이라는 텍스트가 포함되어야 한다', () => {
        const { historyDisplay } = setup();
        expect(historyDisplay).toHaveTextContent('최근 기록: ');
    });

    describe('버튼 스타일', () => {
        it('모든 버튼은 동일한 크기여야 한다', () => {
            const { getAllButtons } = setup();
            const buttons = getAllButtons();

            buttons.forEach((button) => {
                expect(button).toHaveClass('px-4');
                expect(button).toHaveClass('py-2');
            });
        });

        it('비활성화된 버튼은 시각적으로 구분되어야 한다', async () => {
            const { buttons } = setup({ initialValue: 0, step: 1, maxValue: 1 });
            const { increment, decrement, undo } = buttons;

            expect(decrement).toBeDisabled();
            expect(undo).toBeDisabled();
            expect(increment).not.toBeDisabled();

            await userEvent.click(increment);

            expect(increment).toBeDisabled();
            expect(decrement).not.toBeDisabled();
            expect(undo).not.toBeDisabled();
        });
    });

    describe('숫자 표시 영역', () => {
        it('숫자는 중앙 정렬되어야 한다', () => {
            const { countDisplay } = setup();
            expect(countDisplay).toHaveClass('flex', 'items-center', 'justify-center');
        });
    });

    describe('히스토리 표시', () => {
        it('히스토리는 쉼표로 구분되어 표시되어야 한다', async () => {
            const { buttons, historyDisplay } = setup();
            const { increment } = buttons;

            const initialText = historyDisplay.textContent;
            expect(initialText).toMatch(/최근 기록: \d+$/);

            await userEvent.click(increment);
            const updatedText = historyDisplay.textContent;
            expect(updatedText).toMatch(/최근 기록: \d+(, \d+)+$/);

            await userEvent.click(increment);
            const finalText = historyDisplay.textContent;
            expect(finalText).toMatch(/최근 기록: \d+(, \d+)+(, \d+)+$/);
        });

        it('실행 취소 시 히스토리도 함께 업데이트되어야 한다', async () => {
            const { buttons, historyDisplay } = setup();
            const { increment, undo } = buttons;

            const initialText = historyDisplay.textContent;
            expect(initialText).toMatch(/최근 기록: \d+$/);

            await userEvent.click(increment);
            await userEvent.click(increment);
            const updatedText = historyDisplay.textContent;
            expect(updatedText).toMatch(/최근 기록: \d+(, \d+)+(, \d+)+$/);

            await userEvent.click(undo);
            const undoText = historyDisplay.textContent;
            expect(undoText).toMatch(/최근 기록: \d+(, \d+)+$/);
        });
    });
});
