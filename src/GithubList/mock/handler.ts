import { rest } from 'msw';

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
    rest.get('https://api.github.com/users', (req, res, ctx) => {
        const since = parseInt(req.url.searchParams.get('since') || '0');
        const perPage = parseInt(req.url.searchParams.get('per_page') || '10');

        return res(ctx.status(200), ctx.json(mockUsers.slice(since, since + perPage)));
    }),
];
