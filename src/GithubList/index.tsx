import { useQuery } from '@tanstack/react-query';
import { fetchGitHubUsers } from './api/github.ts';
import { useGitHubUsersStore } from './store/useGithubUserStore.ts';

const GitHubUsers = () => {
    const { currentPage, perPage, setPage } = useGitHubUsersStore();

    const {
        data: users,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['github-users', currentPage, perPage],
        queryFn: () => fetchGitHubUsers(currentPage, perPage),
    });

    if (isLoading) {
        return <div data-testid="loading-indicator">Loading...</div>;
    }

    if (isError) {
        return <div className="text-red-500">에러가 발생했습니다. 다시 시도해주세요.</div>;
    }

    return (
        <div className="p-4">
            <table className="min-w-full">
                <thead>
                    <tr>
                        <th className="px-4 py-2">아바타</th>
                        <th className="px-4 py-2">아이디</th>
                        <th className="px-4 py-2">프로필</th>
                    </tr>
                </thead>
                <tbody>
                    {users?.map((user) => (
                        <tr key={user.id} data-testid={`user-row-${user.id}`} className="text-center">
                            <td className="px-4 py-2">
                                <img
                                    src={user.avatar_url}
                                    alt={`${user.login}'s avatar`}
                                    className="w-16 h-16 m-auto rounded-full"
                                />
                            </td>
                            <td className="px-4 py-2">{user.login}</td>
                            <td className="px-4 py-2">
                                <a
                                    href={user.html_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:text-blue-700"
                                >
                                    프로필 보기
                                </a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <nav className="mt-4 flex justify-center gap-2" role="navigation">
                <button
                    onClick={() => setPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                    이전
                </button>
                <span className="px-4 py-2">페이지 {currentPage}</span>
                <button onClick={() => setPage(currentPage + 1)} className="px-4 py-2 bg-gray-200 rounded">
                    다음
                </button>
            </nav>
        </div>
    );
};

export default GitHubUsers;
