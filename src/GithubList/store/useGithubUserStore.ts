import { create } from 'zustand';

export interface GitHubUser {
    id: number;
    login: string;
    avatar_url: string;
    html_url: string;
}

interface GitHubUsersState {
    currentPage: number;
    perPage: number;
    setPage: (page: number) => void;
    setPerPage: (perPage: number) => void;
}

export const useGitHubUsersStore = create<GitHubUsersState>((set) => ({
    currentPage: 1,
    perPage: 10,
    setPage: (page) => set({ currentPage: page }),
    setPerPage: (perPage) => set({ perPage }),
}));
