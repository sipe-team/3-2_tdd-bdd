import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Counter from ".";

const clickIncreamentButton = async () => {
  await userEvent.click(screen.getByTestId("increment-button"));
};

const clickDecrementButton = async () => {
  await userEvent.click(screen.getByTestId("decrement-button"));
};

const clickResetButton = async () => {
  await userEvent.click(screen.getByTestId("reset-button"));
};

const clickUndoButton = async () => {
  await userEvent.click(screen.getByTestId("undo-button"));
};

const MOCK_INIT = {
  step: 1,
  count: 0,
};

describe("Counter 컴포넌트 기본 기능", () => {
  it("카운터가 초기값 0으로 렌더링되어야 한다", () => {
    render(<Counter />);
    expect(screen.getByTestId("count-display")).toHaveTextContent("0");
  });

  it("증가 버튼 클릭시 기본 step 값(1)만큼 증가해야 한다", async () => {
    render(<Counter />);
    await clickIncreamentButton();
    expect(screen.getByTestId("count-display")).toHaveTextContent("1");
  });

  it("리셋 버튼 클릭시 초기값으로 돌아가야 한다", async () => {
    render(<Counter initialValue={MOCK_INIT.count} />);
    await clickIncreamentButton();
    await clickResetButton();
    expect(screen.getByTestId("count-display")).toHaveTextContent(
      MOCK_INIT.count.toString()
    );
  });
  it("커스텀 초기값이 정상적으로 적용되어야 한다", async () => {
    // arrange
    render(<Counter />);

    // assert
    expect(screen.getByTestId("decrement-button")).toHaveTextContent(
      `${MOCK_INIT.step}만큼 감소`
    );
    expect(screen.getByTestId("count-display")).toHaveTextContent(
      MOCK_INIT.count.toString()
    );
  });
  it("설정된 step 값만큼 증가/감소해야 한다", async () => {
    // arrange
    const MOCK_STEP = 3;
    render(
      <Counter step={MOCK_STEP} initialValue={MOCK_INIT.count} maxValue={10} />
    );

    // act
    await clickIncreamentButton();

    // assert
    expect(screen.getByTestId("count-display")).toHaveTextContent(
      MOCK_STEP.toString()
    );
  });
  it("최대값에 도달하면 증가 버튼이 비활성화되어야 한다", async () => {
    // arrange
    const MOCK_MAX_VALUE = 3;
    render(
      <Counter
        maxValue={MOCK_MAX_VALUE}
        step={1}
        initialValue={MOCK_INIT.count}
      />
    );

    // act
    for (let i = 0; i < MOCK_MAX_VALUE; i++) {
      await clickIncreamentButton();
    }

    // assert
    expect(screen.getByTestId("increment-button")).toBeDisabled();
  });
  it("최소값에 도달하면 감소 버튼이 비활성화되어야 한다", async () => {
    // arrange
    const MOCK_MIN_VALUE = -3;
    render(
      <Counter
        minValue={MOCK_MIN_VALUE}
        step={1}
        initialValue={MOCK_INIT.count}
      />
    );

    // act
    for (let i = 0; i < -MOCK_MIN_VALUE; i++) {
      await clickDecrementButton();
    }

    // assert
    expect(screen.getByTestId("decrement-button")).toBeDisabled();
  });
  it("값이 변경될 때마다 onCountChange 콜백이 호출되어야 한다", async () => {
    // arrange
    const mockOnCountChange = jest.fn();
    render(<Counter onCountChange={mockOnCountChange} />);

    // act
    await clickIncreamentButton();

    // assert
    expect(mockOnCountChange).toHaveBeenCalledTimes(1);
  });
  it("최대값 도달 시 onMaxReached 콜백이 호출되어야 한다", async () => {
    // arrange
    const MOCK_MAX_VALUE = 3;
    const mockOnMaxReached = jest.fn();
    render(
      <Counter
        maxValue={MOCK_MAX_VALUE}
        onMaxReached={mockOnMaxReached}
        step={1}
        initialValue={MOCK_INIT.count}
      />
    );

    // act
    for (let i = 0; i < MOCK_MAX_VALUE; i++) {
      await clickIncreamentButton();
    }

    // assert
    expect(mockOnMaxReached).toHaveBeenCalledTimes(1);
  });
  it("실행 취소 버튼 클릭 시 이전 값으로 돌아가야 한다", async () => {
    // arrange
    render(<Counter />);

    // act
    await clickIncreamentButton();
    await clickUndoButton();

    // assert
    expect(screen.getByTestId("history-display")).toHaveTextContent(
      "최근 기록: 0"
    );
  });
  it("최근 3개의 값이 히스토리에 표시되어야 한다", async () => {
    // arrange
    render(<Counter step={MOCK_INIT.step} initialValue={MOCK_INIT.count} />);

    // act
    await clickIncreamentButton();
    await clickDecrementButton();
    await clickIncreamentButton();

    // assert
    expect(screen.getByTestId("history-display")).toHaveTextContent(
      "최근 기록: 1, 0, 1"
    );
  });
  it("여러 번의 증가/감소 후 실행 취소가 정상적으로 동작해야 한다", async () => {
    // arrange
    render(<Counter initialValue={MOCK_INIT.count} step={MOCK_INIT.step} />);

    // act
    await clickIncreamentButton();
    await clickIncreamentButton();
    await clickDecrementButton();
    await clickUndoButton();

    // assert
    expect(screen.getByTestId("count-display")).toHaveTextContent("2");
  });
});

describe("Counter 컴포넌트 UI 테스트", () => {
  it('제목이 "카운터"로 표시되어야 한다', () => {
    // arrange
    render(<Counter />);

    // assert
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "카운터"
    );
  });

  it("숫자를 표시하는 영역이 있어야 한다", () => {
    // arrange
    render(<Counter />);

    // assert
    expect(screen.getByTestId("count-display")).toBeInTheDocument();
  });

  it("버튼 그룹이 순서대로 [감소-증가-리셋-실행취소] 버튼을 포함해야 한다", () => {
    // arrange
    render(<Counter />);
    const decrementButton = screen.getByTestId("decrement-button");
    const buttonGroup = decrementButton.parentElement;
    if (!buttonGroup) throw new Error("버튼 그룹이 존재하지 않습니다.");

    // assert
    expect(buttonGroup.children[0]).toHaveTextContent("감소");
    expect(buttonGroup.children[1]).toHaveTextContent("증가");
    expect(buttonGroup.children[2]).toHaveTextContent("리셋");
    expect(buttonGroup.children[3]).toHaveTextContent("실행 취소");
  });

  it("증가/감소 버튼에는 step 값이 표시되어야 한다", () => {
    // arrange
    render(<Counter step={3} />);

    // assert
    expect(screen.getByTestId("increment-button")).toHaveTextContent(
      "3만큼 증가"
    );
    expect(screen.getByTestId("decrement-button")).toHaveTextContent(
      "3만큼 감소"
    );
  });

  it('히스토리 영역에는 "최근 기록: "이라는 텍스트가 포함되어야 한다', () => {
    // arrange
    render(<Counter />);

    // assert
    expect(screen.getByTestId("history-display")).toHaveTextContent(
      "최근 기록:"
    );
  });

  describe("버튼 스타일", () => {
    it("모든 버튼은 동일한 크기여야 한다", () => {
      // arrange
      render(<Counter />);

      // assert
      const buttons = screen.getAllByRole("button");
      const firstButton = buttons[0];
      const firstButtonWidth = window.getComputedStyle(firstButton).width;

      buttons.forEach((button) => {
        expect(window.getComputedStyle(button).width).toBe(firstButtonWidth);
      });
    });

    it("비활성화된 버튼은 시각적으로 구분되어야 한다", async () => {
      // arrange
      render(<Counter maxValue={1} />);
      const incrementButton = screen.getByTestId("increment-button");

      // act
      await clickIncreamentButton();

      // assert: disabled
      expect(incrementButton).toBeDisabled();
      window.getComputedStyle(incrementButton);

      // assert: check disabled button style
      expect(incrementButton).toHaveStyle({
        cursor: "not-allowed",
      });
    });
  });

  describe("숫자 표시 영역", () => {
    it("숫자는 중앙 정렬되어야 한다", () => {
      // arrange
      render(<Counter />);
      const countDisplay = screen.getByTestId("count-display");
      const style = window.getComputedStyle(countDisplay);

      // assert
      expect(style.alignItems).toBe("center");
      expect(style.justifyContent).toBe("center");
    });
  });

  describe("히스토리 표시", () => {
    it("히스토리는 쉼표로 구분되어 표시되어야 한다", async () => {
      // arrange
      render(<Counter />);

      // act
      await clickIncreamentButton();
      await clickDecrementButton();
      await clickIncreamentButton();

      // assert
      expect(screen.getByTestId("history-display")).toHaveTextContent(
        "최근 기록: 1, 0, 1"
      );
    });

    it("실행 취소 시 히스토리도 함께 업데이트되어야 한다", async () => {
      // arrange
      render(<Counter />);

      // act
      await clickIncreamentButton();
      await clickDecrementButton();
      await clickIncreamentButton();
      await clickUndoButton();

      // assert
      expect(screen.getByTestId("history-display")).toHaveTextContent(
        "최근 기록: 0, 1, 0"
      );
    });
  });
});
