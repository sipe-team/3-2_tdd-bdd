import { useEffect, useState } from 'react';
import type { GitHubUser } from './types/github';

declare global {
    interface Window {
        usersCache: GitHubUser[] | null;
    }
}

window.usersCache = null;

function App() {
    const [users, setUsers] = useState<GitHubUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                if (window.usersCache) {
                    setUsers(window.usersCache);
                    setLoading(false);
                    return;
                }

                const response = await fetch('https://api.github.com/users');
                if (!response.ok) {
                    throw new Error(response.status === 401 ? 'Authentication required' : 'Failed to fetch users');
                }
                const data = await response.json();
                window.usersCache = data;
                setUsers(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-xl" role="status">
                    Loading...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-red-500" role="alert">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-center mb-8">GitHub Users</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users.map((user) => (
                        <article
                            key={user.id}
                            className="bg-white rounded-xl shadow-md overflow-hidden"
                            aria-label={`${user.login}의 GitHub 프로필 카드`}
                        >
                            <div className="p-6">
                                <div className="flex items-center">
                                    <img
                                        className="h-12 w-12 rounded-full"
                                        src={user.avatar_url}
                                        alt={`${user.login}'s avatar`}
                                    />
                                    <div className="ml-4">
                                        <h2 className="text-xl font-semibold" data-testid="user-name">
                                            {user.login}
                                        </h2>
                                        <a
                                            href={user.html_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:text-blue-700"
                                        >
                                            View Profile
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default App;
