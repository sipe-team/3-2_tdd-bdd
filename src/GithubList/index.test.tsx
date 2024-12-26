import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as githubApi from './api/github';
import GitHubUsers from './index';

// Mock 데이터 정의
const mockUsers = [
    {
        login: 'mojombo',
        id: 1,
        avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
        html_url: 'https://github.com/mojombo',
    },
    {
        login: 'defunkt',
        id: 2,
        avatar_url: 'https://avatars.githubusercontent.com/u/2?v=4',
        html_url: 'https://github.com/defunkt',
    },
    {
        login: 'pjhyett',
        id: 3,
        avatar_url: 'https://avatars.githubusercontent.com/u/3?v=4',
        html_url: 'https://github.com/pjhyett',
    },
];

// Github API 모킹
jest.mock('./api/github', () => ({
    fetchGitHubUsers: jest.fn(),
}));

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
        // 각 테스트 전에 queryClient 초기화
        queryClient.clear();
        // API 모킹 초기화
        jest.clearAllMocks();
    });

    it('로딩 상태를 보여줘야 한다', () => {
        // API가 응답하기 전의 로딩 상태 테스트
        (githubApi.fetchGitHubUsers as jest.Mock).mockImplementation(
            () => new Promise(() => {}), // 영원히 해결되지 않는 프로미스
        );

        renderWithProviders(<GitHubUsers />);
        expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    });

    it('사용자 목록을 렌더링해야 한다', async () => {
        // 성공적인 API 응답 모킹
        (githubApi.fetchGitHubUsers as jest.Mock).mockResolvedValue(mockUsers);

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
            const profileLinks = screen.getAllByRole('link', { name: '프로필 보기' });
            const userProfileLink = profileLinks.find((link) => link.getAttribute('href') === user.html_url);
            expect(userProfileLink).toHaveAttribute('href', user.html_url);
        });
    });

    it('에러 상태를 보여줘야 한다', async () => {
        // API 에러 응답 모킹
        (githubApi.fetchGitHubUsers as jest.Mock).mockRejectedValue(new Error('API Error'));

        renderWithProviders(<GitHubUsers />);

        // 에러 메시지 확인
        await waitFor(() => {
            expect(screen.getByText('에러가 발생했습니다. 다시 시도해주세요.')).toBeInTheDocument();
        });
    });

    it('페이지네이션이 동작해야 한다', async () => {
        // 첫 번째 페이지 데이터 모킹
        (githubApi.fetchGitHubUsers as jest.Mock).mockResolvedValueOnce(mockUsers);

        renderWithProviders(<GitHubUsers />);

        // 초기 페이지 확인
        await waitFor(() => {
            expect(screen.getByText('페이지 1')).toBeInTheDocument();
        });

        // 다음 페이지 데이터 모킹
        (githubApi.fetchGitHubUsers as jest.Mock).mockResolvedValueOnce([
            // 다른 페이지의 mock 데이터
            {
                login: 'ezmobius',
                id: 5,
                avatar_url: 'https://avatars.githubusercontent.com/u/5?v=4',
                html_url: 'https://github.com/ezmobius',
            },
        ]);

        // 다음 페이지 버튼 클릭
        fireEvent.click(screen.getByText('다음'));

        // 페이지 변경 확인
        await waitFor(() => {
            expect(screen.getByText('페이지 2')).toBeInTheDocument();
        });

        // 이전 페이지 데이터 모킹
        (githubApi.fetchGitHubUsers as jest.Mock).mockResolvedValueOnce(mockUsers);

        // 이전 페이지 버튼 클릭
        fireEvent.click(screen.getByText('이전'));

        // 페이지 변경 확인
        await waitFor(() => {
            expect(screen.getByText('페이지 1')).toBeInTheDocument();
        });
    });
});
