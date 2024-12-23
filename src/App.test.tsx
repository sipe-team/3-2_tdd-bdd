import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App 컴포넌트', () => {
    // 기본 렌더링 테스트
    it('should render the heading "Vite + React"', () => {
        render(<App />);
        const headingElement = screen.getByRole('heading', { level: 1 });

        // 정확한 텍스트 매칭
        expect(headingElement).toHaveTextContent('Vite + React');
    });

    // 헤딩 레벨 테스트
    it('should render the text in an h1 tag', () => {
        render(<App />);
        const headingElement = screen.getByText('Vite + React');

        // h1 태그인지 확인
        expect(headingElement.tagName).toBe('H1');
    });

    // 접근성 테스트
    it('should have a main heading that is accessible', () => {
        render(<App />);
        const headingElement = screen.getByRole('heading', {
            level: 1,
            name: 'Vite + React',
        });

        expect(headingElement).toBeInTheDocument();
    });
});
