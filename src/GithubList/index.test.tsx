import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import * as githubApi from './api/github';
import GitHubUsers from './index';

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

jest.mock('./api/github');

const createTestQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                retry: false, // 재시도 비활성화
                gcTime: 0, // 캐시 비활성화
                staleTime: 0, // 데이터를 항상 stale하게 처리
                refetchOnMount: false, // 마운트시 재요청 비활성화
                refetchOnWindowFocus: false, // 윈도우 포커스시 재요청 비활성화
                refetchOnReconnect: false, // 재연결시 재요청 비활성화
            },
            mutations: {
                retry: false,
            },
        },
    });

interface WrapperProps {
    children: React.ReactNode;
}

function TestWrapper({ children }: WrapperProps) {
    const queryClient = createTestQueryClient();
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

const renderWithProviders = (ui: React.ReactElement) => {
    return render(ui, { wrapper: TestWrapper });
};

describe('GitHubUsers 컴포넌트', () => {
    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterAll(() => {
        (console.error as jest.Mock).mockRestore();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('로딩 상태를 보여줘야 한다', () => {
        (githubApi.fetchGitHubUsers as jest.Mock).mockImplementation(() => new Promise(() => {}));

        renderWithProviders(<GitHubUsers />);
        expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    });

    it('사용자 목록을 렌더링해야 한다', async () => {
        (githubApi.fetchGitHubUsers as jest.Mock).mockResolvedValue(mockUsers);

        renderWithProviders(<GitHubUsers />);

        await waitFor(() => {
            mockUsers.forEach((user) => {
                const row = screen.getByTestId(`user-row-${user.id}`);

                const { getByAltText, getByText, getByRole } = within(row);

                expect(getByAltText(`${user.login}'s avatar`)).toBeInTheDocument();

                expect(getByText(user.login)).toBeInTheDocument();

                const profileLink = getByRole('link', { name: '프로필 보기' });
                expect(profileLink).toHaveAttribute('href', user.html_url);
                expect(profileLink).toHaveAttribute('target', '_blank');
                expect(profileLink).toHaveAttribute('rel', 'noopener noreferrer');
            });
        });
    });

    it('에러 상태를 보여줘야 한다', async () => {
        const errorMessage = 'API Error';
        (githubApi.fetchGitHubUsers as jest.Mock).mockRejectedValue(new Error(errorMessage));

        renderWithProviders(<GitHubUsers />);

        await waitFor(() => {
            expect(screen.getByText('에러가 발생했습니다. 다시 시도해주세요.')).toBeInTheDocument();
        });
    });

    describe('페이지네이션', () => {
        it('초기 페이지에서는 이전 버튼이 비활성화되어야 한다', async () => {
            (githubApi.fetchGitHubUsers as jest.Mock).mockResolvedValue(mockUsers);

            renderWithProviders(<GitHubUsers />);

            await waitFor(() => {
                const prevButton = screen.getByRole('button', { name: '이전' });
                expect(prevButton).toBeDisabled();
            });
        });

        it('페이지 이동이 정상적으로 동작해야 한다', async () => {
            (githubApi.fetchGitHubUsers as jest.Mock).mockResolvedValueOnce(mockUsers);

            renderWithProviders(<GitHubUsers />);

            await waitFor(() => {
                expect(screen.getByText('페이지 1')).toBeInTheDocument();
            });

            const nextPageMockUsers = [
                {
                    login: 'ezmobius',
                    id: 5,
                    avatar_url: 'https://avatars.githubusercontent.com/u/5?v=4',
                    html_url: 'https://github.com/ezmobius',
                },
            ];
            (githubApi.fetchGitHubUsers as jest.Mock).mockResolvedValueOnce(nextPageMockUsers);

            fireEvent.click(screen.getByRole('button', { name: '다음' }));

            await waitFor(() => {
                expect(screen.getByText('페이지 2')).toBeInTheDocument();
                expect(screen.getByTestId('user-row-5')).toBeInTheDocument();
            });

            expect(githubApi.fetchGitHubUsers).toHaveBeenCalledWith(2, 10);
        });
    });
});
