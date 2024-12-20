import { http, HttpResponse } from 'msw';

export const handlers = [
    http.get('https://api.github.com/users', ({ request }) => {
        const url = new URL(request.url);
        const since = Number(url.searchParams.get('since')) || 0;
        const perPage = Number(url.searchParams.get('per_page')) || 10;

        // 페이지에 따른 mock 데이터 생성
        const users = Array.from({ length: perPage }, (_, i) => ({
            id: since + i + 1,
            login: `user${since + i + 1}`,
            avatar_url: `https://example.com/avatar${since + i + 1}.jpg`,
            html_url: `https://github.com/user${since + i + 1}`,
        }));

        return HttpResponse.json(users);
    }),
];
