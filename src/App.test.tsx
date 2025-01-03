import { cleanup, render, screen, waitForElementToBeRemoved, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse, delay } from 'msw';
import App from './App';
import { server } from './mocks/node';

describe('GitHub 사용자 목록 앱', () => {
    // 테스트 이전 실행
    beforeEach(() => {
        window.usersCache = null;
        server.resetHandlers();
    });

    // 각 테스트 후에 실행
    afterEach(() => {
        cleanup();
    });

    describe('로딩 상태 테스트', () => {
        it('초기에 로딩 상태를 보여줘야 한다', () => {
            render(<App />);
            expect(screen.getByText('Loading...')).toBeInTheDocument();
        });

        it('네트워크 지연 시에도 로딩 상태가 정상적으로 표시되어야 한다', async () => {
            server.use(
                http.get('https://api.github.com/users', async () => {
                    await delay(500);
                    return HttpResponse.json([]);
                }),
            );

            render(<App />);
            expect(screen.getByText('Loading...')).toBeInTheDocument();
            await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));
        });
    });

    describe('데이터 표시 테스트', () => {
        it('사용자 목록이 ID 순서대로 정렬되어야 한다', async () => {
            render(<App />);
            await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));

            const userNames = screen.getAllByTestId('user-name').map((heading) => heading.textContent);
            expect(userNames).toEqual(['mojombo', 'defunkt', 'pjhyett', 'wycats', 'ezmobius', 'ivey']);
        });

        it('페이지당 표시되는 사용자 수가 제한되어야 한다', async () => {
            const perPage = 3;
            server.use(
                http.get('https://api.github.com/users', ({ request }) => {
                    const url = new URL(request.url);
                    const page = Number(url.searchParams.get('page')) || 1;
                    const mockData = Array(10)
                        .fill(null)
                        .map((_, index) => ({
                            id: index + 1,
                            login: `user${index + 1}`,
                            avatar_url: `https://example.com/avatar${index + 1}.jpg`,
                            html_url: `https://github.com/user${index + 1}`,
                            // ... other required fields
                        }));

                    const start = (page - 1) * perPage;
                    const end = start + perPage;
                    return HttpResponse.json(mockData.slice(start, end));
                }),
            );

            render(<App />);
            await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));

            const userCards = screen.getAllByRole('article');
            expect(userCards).toHaveLength(perPage);
        });
    });

    describe('데이터 캐싱 테스트', () => {
        it('두 번째 렌더링에서는 캐시된 데이터를 사용해야 한다', async () => {
            let callCount = 0;
            server.use(
                http.get('https://api.github.com/users', () => {
                    callCount++;
                    return HttpResponse.json([
                        {
                            id: 1,
                            login: 'testuser',
                            avatar_url: 'https://example.com/avatar.jpg',
                            html_url: 'https://github.com/testuser',
                        },
                    ]);
                }),
            );

            const { unmount } = render(<App />);
            await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));

            unmount();

            render(<App />);

            expect(callCount).toBe(1);
        });
    });

    describe('사용자 상호작용 테스트', () => {
        it('사용자 카드 클릭 시 상세 정보가 표시되어야 한다', async () => {
            const user = userEvent.setup();
            render(<App />);
            await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));

            const firstUserCard = screen.getAllByRole('article')[0];
            await user.click(firstUserCard);

            const userName = within(firstUserCard).getByTestId('user-name').textContent;
            const profileLink = within(firstUserCard).getByRole('link', { name: /view profile/i });
            expect(profileLink).toHaveAttribute('href', `https://github.com/${userName}`);
        });
    });

    describe('접근성 테스트', () => {
        it('키보드로 모든 사용자 카드에 접근할 수 있어야 한다', async () => {
            const user = userEvent.setup();
            render(<App />);
            await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));

            const cards = screen.getAllByRole('article');
            for (const card of cards) {
                const link = within(card).getByRole('link');
                expect(link).toHaveAttribute('href');

                await user.tab();
                expect(link).toHaveFocus();
            }
        });

        it('스크린 리더를 위한 적절한 aria-label이 있어야 한다', async () => {
            render(<App />);
            await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));

            const cards = screen.getAllByRole('article');
            cards.forEach((card) => {
                const userName = within(card).getByTestId('user-name').textContent;
                expect(card).toHaveAttribute('aria-label', `${userName}의 GitHub 프로필 카드`);
            });
        });
    });
});
