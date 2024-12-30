import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Counter from '.';

const getButton = (name: string) => screen.getByRole('button', { name });

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
    const 커스텀초기값 = 5;
    render(<Counter initialValue={커스텀초기값} />);

    expect(screen.getByTestId('count-display')).toHaveTextContent(커스텀초기값.toString());
  });

  it('설정된 step 값만큼 증가/감소해야 한다', async () => {
    const 커스텀스텝 = 2;
    render(<Counter step={커스텀스텝} />);

    await userEvent.click(getButton('증가'));
    expect(screen.getByTestId('count-display')).toHaveTextContent(커스텀스텝.toString());
    await userEvent.click(getButton('감소'));
    expect(screen.getByTestId('count-display')).toHaveTextContent('0');
  });

  it('최대값에 도달하면 증가 버튼이 비활성화되어야 한다', async () => {
    const 최대값 = 5;
    render(<Counter initialValue={최대값} maxValue={최대값} />);

    expect(getButton('증가')).toBeDisabled();
  });

  it('최소값에 도달하면 감소 버튼이 비활성화되어야 한다', async () => {
    const 최소값 = 5;
    render(<Counter initialValue={최소값} minValue={최소값} />);

    expect(getButton('감소')).toBeDisabled();
  });

  it('값이 변경될 때마다 onCountChange 콜백이 호출되어야 한다', async () => {
    const mockedOnCountChange = jest.fn();
    render(<Counter onCountChange={mockedOnCountChange} />);

    await userEvent.click(getButton('증가'));

    expect(mockedOnCountChange).toHaveBeenCalledTimes(1);
  });

  it('최대값 도달 시 onMaxReached 콜백이 호출되어야 한다', async () => {
    const mockedOnMaxReached = jest.fn();
    const 초기값 = 0;
    const 최대값 = 10;
    render(<Counter initialValue={초기값} maxValue={최대값} onMaxReached={mockedOnMaxReached} />);

    for (let i = 초기값; i < 최대값; i++) {
      await userEvent.click(getButton('증가'));
    }

    expect(mockedOnMaxReached).toHaveBeenCalled();
  });

  it('실행 취소 버튼 클릭 시 이전 값으로 돌아가야 한다', async () => {
    render(<Counter />);

    await userEvent.click(getButton('증가'));
    await userEvent.click(getButton('실행 취소'));

    expect(screen.getByTestId('count-display')).toHaveTextContent('0');
  });

  it('최근 3개의 값이 히스토리에 표시되어야 한다', async () => {
    render(<Counter />);

    await userEvent.click(getButton('증가'));
    await userEvent.click(getButton('증가'));
    await userEvent.click(getButton('증가'));

    expect(screen.getByTestId('history-display')).toHaveTextContent('1, 2, 3');
  });

  it('여러 번의 증가/감소 후 실행 취소가 정상적으로 동작해야 한다', async () => {
    render(<Counter />);

    await userEvent.click(getButton('증가'));
    await userEvent.click(getButton('감소'));
    await userEvent.click(getButton('실행 취소'));

    expect(screen.getByTestId('count-display')).toHaveTextContent('1');
  });
});

describe('Counter 컴포넌트 UI 테스트', () => {
  it('제목이 "카운터"로 표시되어야 한다', () => {
    render(<Counter />);

    expect(screen.getByRole('heading')).toHaveTextContent('카운터');
  });

  it('숫자를 표시하는 영역이 있어야 한다', () => {
    render(<Counter />);

    expect(screen.getByTestId('count-display')).toBeInTheDocument();
  });

  it('버튼 그룹이 순서대로 [감소-증가-리셋-실행취소] 버튼을 포함해야 한다', () => {
    render(<Counter />);

    expect(screen.getAllByRole('button').map((버튼) => 버튼.textContent)).toEqual([
      '1만큼 감소',
      '1만큼 증가',
      '리셋',
      '실행 취소',
    ]);
  });

  it('증가/감소 버튼에는 step 값이 표시되어야 한다', () => {
    render(<Counter />);

    expect(getButton('증가')).toHaveTextContent('1');
    expect(getButton('감소')).toHaveTextContent('1');
  });

  it('히스토리 영역에는 "최근 기록: "이라는 텍스트가 포함되어야 한다', () => {
    render(<Counter />);

    expect(screen.getByTestId('history-display')).toHaveTextContent('최근 기록: ');
  });

  describe('버튼 스타일', () => {
    it('모든 버튼은 동일한 크기여야 한다', () => {
      render(<Counter />);

      screen.getAllByRole('button').forEach((버튼) => {
        expect(버튼).toHaveClass('px-4 py-2');
      });
    });

    it('비활성화된 버튼은 시각적으로 구분되어야 한다', () => {
      render(<Counter />);

      expect(getButton('증가')).not.toHaveClass('disabled:opacity-50 disabled:cursor-not-allowed');
      expect(getButton('실행 취소')).toHaveClass('disabled:opacity-50 disabled:cursor-not-allowed');
    });
  });

  describe('숫자 표시 영역', () => {
    it('숫자는 중앙 정렬되어야 한다', () => {
      render(<Counter />);

      expect(screen.getByTestId('count-display')).toHaveClass('flex items-center justify-center');
    });
  });

  describe('히스토리 표시', () => {
    it('히스토리는 쉼표로 구분되어 표시되어야 한다', async () => {
      render(<Counter />);

      await userEvent.click(getButton('증가'));

      expect(screen.getByTestId('history-display')).toHaveTextContent('0, 1');
    });

    it('실행 취소 시 히스토리도 함께 업데이트되어야 한다', async () => {
      render(<Counter />);

      await userEvent.click(getButton('증가'));
      await userEvent.click(getButton('실행 취소'));

      expect(screen.getByTestId('history-display')).toHaveTextContent('0');
    });
  });
});
