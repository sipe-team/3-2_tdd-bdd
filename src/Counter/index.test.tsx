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
        // 테스트 구현
    });
    it('설정된 step 값만큼 증가/감소해야 한다', async () => {
        // 테스트 구현
    });
    it('최대값에 도달하면 증가 버튼이 비활성화되어야 한다', async () => {
        // 테스트 구현
    });
    it('최소값에 도달하면 감소 버튼이 비활성화되어야 한다', async () => {
        // 테스트 구현
    });
    it('값이 변경될 때마다 onCountChange 콜백이 호출되어야 한다', async () => {
        // 테스트 구현
    });
    it('최대값 도달 시 onMaxReached 콜백이 호출되어야 한다', async () => {
        // 테스트 구현
    });
    it('실행 취소 버튼 클릭 시 이전 값으로 돌아가야 한다', async () => {
        // 테스트 구현
    });
    it('최근 3개의 값이 히스토리에 표시되어야 한다', async () => {
        // 테스트 구현
    });
    it('여러 번의 증가/감소 후 실행 취소가 정상적으로 동작해야 한다', async () => {
        // 테스트 구현
    });
});

describe('Counter 컴포넌트 UI 테스트', () => {
    it('제목이 "카운터"로 표시되어야 한다', () => {
        // 테스트 구현
    });

    it('숫자를 표시하는 영역이 있어야 한다', () => {
        // 테스트 구현
    });

    it('버튼 그룹이 순서대로 [감소-증가-리셋-실행취소] 버튼을 포함해야 한다', () => {
        // 테스트 구현
    });

    it('증가/감소 버튼에는 step 값이 표시되어야 한다', () => {
        // 테스트 구현
    });

    it('히스토리 영역에는 "최근 기록: "이라는 텍스트가 포함되어야 한다', () => {
        // 테스트 구현
    });

    describe('버튼 스타일', () => {
        it('모든 버튼은 동일한 크기여야 한다', () => {
            // 테스트 구현
        });

        it('비활성화된 버튼은 시각적으로 구분되어야 한다', () => {
            // 테스트 구현
        });
    });

    describe('숫자 표시 영역', () => {
        it('숫자는 중앙 정렬되어야 한다', () => {
            // 테스트 구현
        });
    });

    describe('히스토리 표시', () => {
        it('히스토리는 쉼표로 구분되어 표시되어야 한다', () => {
            // 테스트 구현
        });
    });
});
