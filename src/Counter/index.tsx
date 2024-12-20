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
        <div className="flex flex-col items-center space-y-6" data-testid="counter">
            <h2 className="text-2xl font-semibold text-gray-800">카운터</h2>

            <div
                className="text-6xl font-bold text-blue-600 bg-blue-50 w-32 h-32 rounded-full flex items-center justify-center"
                aria-live="polite"
                data-testid="count-display"
            >
                {count}
            </div>

            <div className="button-group flex flex-wrap gap-2 justify-center">
                <button
                    onClick={decrement}
                    disabled={count <= minValue}
                    aria-label="감소"
                    data-testid="decrement-button"
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-10 disabled:cursor-not-allowed transition-colors"
                >
                    {step}만큼 감소
                </button>
                <button
                    onClick={increment}
                    disabled={count >= maxValue}
                    aria-label="증가"
                    data-testid="increment-button"
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-10 disabled:cursor-not-allowed transition-colors"
                >
                    {step}만큼 증가
                </button>
                <button
                    onClick={reset}
                    aria-label="리셋"
                    data-testid="reset-button"
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                >
                    리셋
                </button>
                <button
                    onClick={undo}
                    disabled={history.length <= 1}
                    aria-label="실행 취소"
                    data-testid="undo-button"
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    실행 취소
                </button>
            </div>

            <div className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded" data-testid="history-display">
                최근 기록: {history.slice(-3).join(', ')}
            </div>
        </div>
    );
};

export default Counter;
