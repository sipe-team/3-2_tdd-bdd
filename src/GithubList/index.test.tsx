import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import GitHubUsers from './index';

// Mock data
const mockUsers = [
    {
        id: 1,
        login: 'user1',
        avatar_url: 'https://example.com/avatar1.jpg',
        html_url: 'https://github.com/user1',
    },
    {
        id: 2,
        login: 'user2',
        avatar_url: 'https://example.com/avatar2.jpg',
        html_url: 'https://github.com/user2',
    },
];

// MSW 서버 설정
const server = setupServer(
    http.get('https://api.github.com/users', () => {
        return HttpResponse.json(mockUsers);
    }),
);

// 테스트 환경 설정
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

// 테스트 시작 전 서버 시작
beforeAll(() => server.listen());
// 각 테스트 후 핸들러 리셋
afterEach(() => {
    server.resetHandlers();
    queryClient.clear();
});
// 모든 테스트 후 서버 종료
afterAll(() => server.close());

describe('GitHubUsers 컴포넌트', () => {
    it('로딩 상태를 보여줘야 한다', () => {
        renderWithProviders(<GitHubUsers />);
        expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    });

    it('사용자 목록을 렌더링해야 한다', async () => {
        renderWithProviders(<GitHubUsers />);

        // 사용자 목록이 로드될 때까지 대기
        await waitFor(() => {
            mockUsers.forEach((user) => {
                expect(screen.getByTestId(`user-row-${user.id}`)).toBeInTheDocument();
            });
        });

        // 각 사용자의 정보가 올바르게 표시되는지 확인
        mockUsers.forEach((user) => {
            expect(screen.getByText(user.login)).toBeInTheDocument();
            expect(screen.getByAltText(`${user.login}'s avatar`)).toBeInTheDocument();
        });
    });

    it('에러 상태를 보여줘야 한다', async () => {
        // 에러 응답을 보내도록 서버 설정 변경
        server.use(
            http.get('https://api.github.com/users', () => {
                return new HttpResponse(null, { status: 500 });
            }),
        );

        renderWithProviders(<GitHubUsers />);

        // 에러 메시지 확인
        await waitFor(() => {
            expect(screen.getByText('에러가 발생했습니다. 다시 시도해주세요.')).toBeInTheDocument();
        });
    });

    it('페이지네이션이 동작해야 한다', async () => {
        renderWithProviders(<GitHubUsers />);

        // 초기 페이지 확인
        await waitFor(() => {
            expect(screen.getByText('페이지 1')).toBeInTheDocument();
        });

        // 다음 페이지 버튼 클릭
        fireEvent.click(screen.getByText('다음'));

        // 페이지 변경 확인
        await waitFor(() => {
            expect(screen.getByText('페이지 2')).toBeInTheDocument();
        });

        // 이전 페이지 버튼 클릭
        fireEvent.click(screen.getByText('이전'));

        // 페이지 변경 확인
        await waitFor(() => {
            expect(screen.getByText('페이지 1')).toBeInTheDocument();
        });
    });
});
