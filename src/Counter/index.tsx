import { useCallback, useState } from 'react';

interface CounterProps {
    initialValue?: number;
    step?: number;
    maxValue?: number;
    minValue?: number;
    onCountChange?: (count: number) => void;
    onMaxReached?: () => void;
    onMinReached?: () => void;
}

export interface CounterRef {
    getCurrentCount: () => number;
    resetCount: () => void;
}

const Counter = ({
    initialValue = 0,
    step = 1,
    maxValue = 10,
    minValue = 0,
    onCountChange,
    onMaxReached,
    onMinReached,
}: CounterProps) => {
    const [count, setCount] = useState(initialValue);
    const [history, setHistory] = useState<number[]>([initialValue]);

    const updateCount = useCallback(
        (newCount: number) => {
            if (newCount <= maxValue && newCount >= minValue) {
                setCount(newCount);
                setHistory((prev) => [...prev, newCount]);
                onCountChange?.(newCount);

                if (newCount === maxValue) {
                    onMaxReached?.();
                }
                if (newCount === minValue) {
                    onMinReached?.();
                }
            }
        },
        [maxValue, minValue, onCountChange, onMaxReached, onMinReached],
    );

    const increment = () => {
        updateCount(count + step);
    };

    const decrement = () => {
        updateCount(count - step);
    };

    const reset = () => {
        setCount(initialValue);
        setHistory([initialValue]);
        onCountChange?.(initialValue);
    };

    const undo = () => {
        if (history.length > 1) {
            const newHistory = history.slice(0, -1);
            setHistory(newHistory);
            setCount(newHistory[newHistory.length - 1]);
            onCountChange?.(newHistory[newHistory.length - 1]);
        }
    };

    return (
        <div className="counter" data-testid="counter">
            <h2>카운터</h2>
            <div className="count-display" aria-live="polite" data-testid="count-display">
                {count}
            </div>
            <div className="button-group">
                <button
                    onClick={decrement}
                    disabled={count <= minValue}
                    aria-label="감소"
                    data-testid="decrement-button"
                >
                    {step}만큼 감소
                </button>
                <button
                    onClick={increment}
                    disabled={count >= maxValue}
                    aria-label="증가"
                    data-testid="increment-button"
                >
                    {step}만큼 증가
                </button>
                <button onClick={reset} aria-label="리셋" data-testid="reset-button">
                    리셋
                </button>
                <button onClick={undo} disabled={history.length <= 1} aria-label="실행 취소" data-testid="undo-button">
                    실행 취소
                </button>
            </div>
            <div className="history" data-testid="history-display">
                최근 기록: {history.slice(-3).join(', ')}
            </div>
        </div>
    );
};

export default Counter;
