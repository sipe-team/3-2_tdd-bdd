import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GitHubUsers from '.';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

const renderWithProviders = (ui: React.ReactElement) => {
    return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe('GitHubUsers 컴포넌트', () => {
    beforeEach(() => {
        queryClient.clear();
    });

    it('사용자 목록이 테이블 형태로 렌더링되어야 한다', async () => {
        renderWithProviders(<GitHubUsers />);
        const table = await screen.findByRole('table');
        expect(table).toBeInTheDocument();
    });

    it('각 사용자는 아바타, 로그인, ID를 표시해야 한다', async () => {
        renderWithProviders(<GitHubUsers />);
        const firstRow = await screen.findByTestId('user-row-1');

        expect(within(firstRow).getByRole('img')).toBeInTheDocument();
        expect(within(firstRow).getByText('mojombo')).toBeInTheDocument();
        expect(within(firstRow).getByText('1')).toBeInTheDocument();
    });

    it('페이지네이션 컨트롤이 표시되어야 한다', async () => {
        renderWithProviders(<GitHubUsers />);
        const pagination = await screen.findByRole('navigation');
        expect(pagination).toBeInTheDocument();
    });

    it('다음 페이지 버튼 클릭시 다음 페이지 데이터를 로드해야 한다', async () => {
        renderWithProviders(<GitHubUsers />);
        const nextButton = await screen.findByRole('button', { name: /다음/i });
        await userEvent.click(nextButton);

        // 다음 페이지의 첫 번째 사용자 확인
        const nextPageUser = await screen.findByText('defunkt');
        expect(nextPageUser).toBeInTheDocument();
    });

    it('이전 페이지 버튼은 첫 페이지에서 비활성화되어야 한다', async () => {
        renderWithProviders(<GitHubUsers />);
        const prevButton = await screen.findByRole('button', { name: /이전/i });
        expect(prevButton).toBeDisabled();
    });

    it('로딩 중에는 로딩 인디케이터가 표시되어야 한다', async () => {
        renderWithProviders(<GitHubUsers />);
        expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    });

    it('에러 발생시 에러 메시지가 표시되어야 한다', async () => {
        // MSW로 에러 상황 모킹
        server.use(
            rest.get('https://api.github.com/users', (req, res, ctx) => {
                return res(ctx.status(500));
            }),
        );

        renderWithProviders(<GitHubUsers />);
        const errorMessage = await screen.findByText(/에러가 발생했습니다/i);
        expect(errorMessage).toBeInTheDocument();
    });

    it('사용자당 깃허브 프로필 링크가 제공되어야 한다', async () => {
        renderWithProviders(<GitHubUsers />);
        const firstUserLink = await screen.findByRole('link', { name: /mojombo/i });
        expect(firstUserLink).toHaveAttribute('href', 'https://github.com/mojombo');
    });
});
