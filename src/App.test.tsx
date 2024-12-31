import { render, screen, waitForElementToBeRemoved, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import App from './App';
import { server } from './mocks/node';

describe('GitHub 사용자 목록 앱', () => {
    describe('로딩 상태 테스트', () => {
        it('초기에 로딩 상태를 보여줘야 한다', () => {
            render(<App />);
            expect(screen.getByText('Loading...')).toBeInTheDocument();
        });

        it('데이터 로딩 후에는 로딩 상태가 사라져야 한다', async () => {
            render(<App />);
            expect(screen.getByText('Loading...')).toBeInTheDocument();
            await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));
        });
    });

    describe('데이터 표시 테스트', () => {
        it('API 호출 성공 시 사용자 목록이 표시되어야 한다', async () => {
            render(<App />);
            await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));

            // 첫 번째 사용자 정보 확인
            expect(screen.getByText('mojombo')).toBeInTheDocument();

            // 여러 사용자가 표시되는지 확인
            const userCards = screen.getAllByRole('article');
            expect(userCards.length).toBeGreaterThan(1);
        });

        it('각 사용자 카드에는 필수 정보가 모두 포함되어야 한다', async () => {
            render(<App />);
            await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));

            // 첫 번째 사용자 카드 선택
            const firstUserCard = screen.getAllByRole('article')[0];

            // 필수 요소들 확인
            within(firstUserCard).getByRole('img'); // 아바타 이미지
            within(firstUserCard).getByRole('heading'); // 사용자 이름
            within(firstUserCard).getByRole('link'); // 프로필 링크
        });

        it('프로필 링크는 올바른 GitHub 주소를 가리켜야 한다', async () => {
            render(<App />);
            await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));

            const firstUserCard = screen.getAllByRole('article')[0];
            const profileLink = within(firstUserCard).getByRole('link');

            expect(profileLink).toHaveAttribute('href', 'https://github.com/mojombo');
            expect(profileLink).toHaveAttribute('target', '_blank');
            expect(profileLink).toHaveAttribute('rel', 'noopener noreferrer');
        });
    });

    describe('에러 처리 테스트', () => {
        it('API 호출 실패 시 에러 메시지를 표시해야 한다', async () => {
            server.use(
                http.get('https://api.github.com/users', () => {
                    return new HttpResponse(null, { status: 500 });
                }),
            );

            render(<App />);
            await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));
            expect(screen.getByText('Failed to fetch users')).toBeInTheDocument();
        });

        it('네트워크 오류 시 적절한 에러 메시지를 표시해야 한다', async () => {
            server.use(
                http.get('https://api.github.com/users', () => {
                    return HttpResponse.error();
                }),
            );

            render(<App />);
            await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));
            expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
        });

        it('권한 없음(401) 에러 시 인증 필요 메시지를 표시해야 한다', async () => {
            server.use(
                http.get('https://api.github.com/users', () => {
                    return new HttpResponse(null, {
                        status: 401,
                        statusText: 'Unauthorized',
                    });
                }),
            );

            render(<App />);
            await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));
            expect(screen.getByText('Authentication required')).toBeInTheDocument();
        });

        it('서버 에러(500) 시 에러 메시지를 표시해야 한다', async () => {
            server.use(
                http.get('https://api.github.com/users', () => {
                    return new HttpResponse(null, {
                        status: 500,
                        statusText: 'Internal Server Error',
                    });
                }),
            );

            render(<App />);
            await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));
            expect(screen.getByRole('alert')).toHaveTextContent('Failed to fetch users');
        });
    });

    describe('접근성 테스트', () => {
        it('모든 이미지는 대체 텍스트를 가져야 한다', async () => {
            render(<App />);
            await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));

            const images = screen.getAllByRole('img');
            images.forEach((img) => {
                expect(img).toHaveAttribute('alt');
            });
        });

        it('모든 사용자 카드는 적절한 구조를 가져야 한다', async () => {
            render(<App />);
            await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));

            const cards = screen.getAllByRole('article');
            cards.forEach((card) => {
                expect(within(card).getByRole('heading')).toBeInTheDocument();
                expect(within(card).getByRole('link')).toBeInTheDocument();
            });
        });

        it('에러 메시지는 alert 역할을 가져야 한다', async () => {
            server.use(
                http.get('https://api.github.com/users', () => {
                    return new HttpResponse(null, { status: 500 });
                }),
            );

            render(<App />);
            await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));
            expect(screen.getByRole('alert')).toBeInTheDocument();
        });
    });
});
