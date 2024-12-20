import { useState } from 'react';

const Counter = () => {
    const [count, setCount] = useState(0);

    const increment = () => {
        setCount((prev) => prev + 1);
    };

    const decrement = () => {
        setCount((prev) => (prev > 0 ? prev - 1 : 0));
    };

    const reset = () => {
        setCount(0);
    };

    return (
        <div className="counter">
            <h2>카운터</h2>
            <div className="count-display" aria-live="polite">
                {count}
            </div>
            <div className="button-group">
                <button onClick={decrement} disabled={count === 0} aria-label="감소">
                    감소
                </button>
                <button onClick={increment} aria-label="증가">
                    증가
                </button>
                <button onClick={reset} aria-label="리셋">
                    리셋
                </button>
            </div>
        </div>
    );
};

export default Counter;
