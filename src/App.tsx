import GitHubUsers from './GithubList';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <div className="min-h-screen bg-gray-100">
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold text-center mb-8">
                        3주차 : 상태관리 라이브러리 활용해 테스트 작성해보기
                    </h1>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <GitHubUsers />
                    </div>
                </div>
            </div>
        </QueryClientProvider>
    );
}

export default App;
