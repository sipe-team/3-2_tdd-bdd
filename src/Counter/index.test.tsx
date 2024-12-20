import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Counter from './index';

describe('Counter 컴포넌트', () => {
    it('카운터가 0으로 초기화되어 렌더링되어야 한다', () => {
        render(<Counter />);
        const countDisplay = screen.getByText('0');
        expect(countDisplay).toBeInTheDocument();
    });

    it('증가 버튼을 클릭하면 카운터가 1 증가해야 한다', async () => {
        render(<Counter />);
        const incrementButton = screen.getByRole('button', { name: '증가' });

        await userEvent.click(incrementButton);
        expect(screen.getByText('1')).toBeInTheDocument();

        await userEvent.click(incrementButton);
        expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('감소 버튼을 클릭하면 카운터가 1 감소해야 한다', async () => {
        render(<Counter />);
        const decrementButton = screen.getByRole('button', { name: '감소' });
        const incrementButton = screen.getByRole('button', { name: '증가' });

        // 먼저 2로 만들기
        await userEvent.click(incrementButton);
        await userEvent.click(incrementButton);

        await userEvent.click(decrementButton);
        expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('카운터가 0 미만으로 내려가지 않아야 한다', async () => {
        render(<Counter />);
        const decrementButton = screen.getByRole('button', { name: '감소' });

        await userEvent.click(decrementButton);
        expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('리셋 버튼을 클릭하면 카운터가 0으로 초기화되어야 한다', async () => {
        render(<Counter />);
        const resetButton = screen.getByRole('button', { name: '리셋' });
        const incrementButton = screen.getByRole('button', { name: '증가' });

        await userEvent.click(incrementButton);
        await userEvent.click(incrementButton);

        await userEvent.click(resetButton);
        expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('키보드로 버튼들을 조작할 수 있어야 한다', async () => {
        render(<Counter />);

        await userEvent.tab();
        await userEvent.keyboard('[Space]');

        expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('카운터가 0일 때 감소 버튼이 비활성화되어야 한다', () => {
        render(<Counter />);
        const decrementButton = screen.getByRole('button', { name: '감소' });

        expect(decrementButton).toBeDisabled();
    });
});
