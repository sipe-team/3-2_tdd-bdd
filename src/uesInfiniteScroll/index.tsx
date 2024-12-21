import type { Data, InfiniteScrollOptions, InfiniteScrollResult, Service } from './types';

export default function useInfiniteScroll<TData extends Data = Data>(
    service: Service<TData>,
    options: InfiniteScrollOptions<TData> = {},
): InfiniteScrollResult<TData> {
    // TDD를 통해 구현해 나갈 예정입니다.
    return {
        data: undefined as any,
        loading: false,
        loadingMore: false,
        error: undefined,
        noMore: false,
        loadMore: () => {},
        loadMoreAsync: () => Promise.reject(),
        reload: () => {},
        reloadAsync: () => Promise.reject(),
        cancel: () => {},
        mutate: () => {},
    };
}
