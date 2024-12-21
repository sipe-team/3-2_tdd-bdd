import { useRef } from 'react';
import useInfiniteScroll from './uesInfiniteScroll';

interface Post {
    id: number;
    title: string;
    content: string;
}

interface PostListResponse {
    list: Post[];
    nextId?: number;
    hasMore: boolean;
}

// 가상의 데이터 페치 함수
const fetchPosts = async (currentData?: PostListResponse): Promise<PostListResponse> => {
    // 실제로는 API 호출을 하겠지만, 예제를 위해 가상의 데이터를 생성
    const pageSize = 10;
    const startId = currentData ? currentData.nextId : 1;

    // 50개 정도만 생성하도록 제한
    if (startId > 50) {
        return {
            list: [],
            hasMore: false,
        };
    }

    // 페이지 크기만큼의 새로운 게시글 생성
    const newPosts: Post[] = Array.from({ length: pageSize }, (_, index) => ({
        id: startId + index,
        title: `게시글 ${startId + index}`,
        content: `이것은 게시글 ${startId + index}의 내용입니다.`,
    }));

    // 실제 API 호출을 시뮬레이션하기 위한 딜레이
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
        list: newPosts,
        nextId: startId + pageSize,
        hasMore: startId + pageSize <= 50,
    };
};

export default function App() {
    const containerRef = useRef<HTMLDivElement>(null);

    const { data, loading, loadingMore, error, noMore } = useInfiniteScroll<PostListResponse>(fetchPosts, {
        target: containerRef,
        isNoMore: (d) => !d?.hasMore,
        threshold: 100, // 스크롤이 바닥에서 100px 떨어졌을 때 로딩 시작
    });

    if (error) {
        return <div className="p-4 text-red-600">에러가 발생했습니다: {error.message}</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-3xl font-bold mb-8">4주차 : useInfiniteScroll TDD</h1>

            <div ref={containerRef} className="space-y-4 h-[600px] overflow-y-auto">
                {loading && !data ? (
                    <div className="text-center p-4">로딩 중...</div>
                ) : (
                    <>
                        {data?.list.map((post) => (
                            <div
                                key={post.id}
                                className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                            >
                                <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                                <p className="text-gray-600">{post.content}</p>
                            </div>
                        ))}

                        {loadingMore && <div className="text-center p-4">추가 데이터 로딩 중...</div>}

                        {noMore && <div className="text-center p-4 text-gray-500">더 이상 데이터가 없습니다.</div>}
                    </>
                )}
            </div>
        </div>
    );
}
