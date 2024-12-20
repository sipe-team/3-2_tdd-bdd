import axios from 'axios';
import type { GitHubUser } from '../store/useGithubUserStore';

const api = axios.create({
    baseURL: 'https://api.github.com',
});

export const fetchGitHubUsers = async (page: number, perPage: number) => {
    const response = await api.get<GitHubUser[]>('/users', {
        params: {
            since: (page - 1) * perPage,
            per_page: perPage,
        },
    });
    return response.data;
};
