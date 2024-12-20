import { http } from 'msw';

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
];

export const handlers = [
    http.get('https://api.github.com/users', ({ request }) => {
        const url = new URL(request.url);
        const since = parseInt(url.searchParams.get('since') || '0');
        const perPage = parseInt(url.searchParams.get('per_page') || '10');

        return Response.json(mockUsers.slice(since, since + perPage));
    }),
];
