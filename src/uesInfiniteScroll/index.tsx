import { useEffect, useRef, useState } from 'react';
import { isFunction } from '../utils';
import { getScrollElement, getTargetElement } from '../utils/domTarget';
import { getClientHeight, getScrollHeight, getScrollTop } from '../utils/rect';
import type { Data, InfiniteScrollOptions, InfiniteScrollResult, Service } from './types';

export default function useInfiniteScroll<TData extends Data = Data>(
    service: Service<TData>,
    options: InfiniteScrollOptions<TData> = {},
): InfiniteScrollResult<TData> {
    const {
        target,
        isNoMore,
        threshold = 100,
        direction = 'bottom',
        manual = false,
        reloadDeps = [],
        onBefore,
        onSuccess,
        onError,
        onFinally,
    } = options;

    const [data, setData] = useState<TData>();
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<Error>();
    const [noMore, setNoMore] = useState(false);

    const reachBottomRef = useRef(false);
    const targetRef = useRef<HTMLElement | Document>();
    const hasMoreRef = useRef(true);
    const controllerRef = useRef<AbortController>();

    const checkIsNoMore = (currentData?: TData) => {
        if (!isNoMore || !currentData) return false;
        return isNoMore(currentData);
    };

    const scrollMethod = async () => {
        if (!targetRef.current) return;
        if (loading || loadingMore || !hasMoreRef.current) return;

        const scrollTop = getScrollTop(targetRef.current);
        const scrollHeight = getScrollHeight(targetRef.current);
        const clientHeight = getClientHeight(targetRef.current);

        if (direction === 'bottom') {
            const isReachBottom = scrollHeight - (scrollTop + clientHeight) <= threshold;
            if (isReachBottom) {
                reachBottomRef.current = true;
                await loadMore();
            }
        } else {
            const isReachTop = scrollTop <= threshold;
            if (isReachTop) {
                reachBottomRef.current = true;
                await loadMore();
            }
        }
    };

    const loadData = async (isLoadMore = false) => {
        if (!service) return;

        try {
            controllerRef.current = new AbortController();
            const currentData = isLoadMore ? data : undefined;

            if (!isLoadMore) {
                setError(undefined);
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            isFunction(onBefore) && onBefore();

            const responseData = await service(currentData);

            if (direction === 'top' && isLoadMore && targetRef.current) {
                const currentHeight = getScrollHeight(targetRef.current);

                setData((oldData) => {
                    if (!oldData?.list || !responseData?.list) return responseData;
                    return {
                        ...responseData,
                        list: [...responseData.list, ...oldData.list],
                    };
                });

                setTimeout(() => {
                    if (targetRef.current) {
                        const newHeight = getScrollHeight(targetRef.current);
                        const scrollElement = getScrollElement(targetRef.current);

                        if (scrollElement === document) {
                            window.scrollTo(0, newHeight - currentHeight);
                        } else {
                            (scrollElement as HTMLElement).scrollTo(0, newHeight - currentHeight);
                        }
                    }
                });
            } else {
                setData((oldData) => {
                    if (!oldData?.list || !responseData?.list || !isLoadMore) return responseData;
                    return {
                        ...responseData,
                        list: [...oldData.list, ...responseData.list],
                    };
                });
            }

            const isNoMoreData = checkIsNoMore(responseData);
            hasMoreRef.current = !isNoMoreData;
            setNoMore(isNoMoreData);

            isFunction(onSuccess) && onSuccess(responseData);
            return responseData;
        } catch (e) {
            const currentError = e instanceof Error ? e : new Error(String(e));
            setError(currentError);
            isFunction(onError) && onError(currentError);
            throw currentError;
        } finally {
            if (!isLoadMore) {
                setLoading(false);
            } else {
                setLoadingMore(false);
            }
            isFunction(onFinally) && onFinally(data, error);
        }
    };

    const loadMore = () => {
        if (loading || loadingMore || !hasMoreRef.current) return;
        loadData(true).catch(() => {});
    };

    const loadMoreAsync = () => {
        if (loading || loadingMore || !hasMoreRef.current) return Promise.reject();
        return loadData(true);
    };

    const reload = () => {
        hasMoreRef.current = true;
        setNoMore(false);
        loadData(false).catch(() => {});
    };

    const reloadAsync = () => {
        hasMoreRef.current = true;
        setNoMore(false);
        return loadData(false);
    };

    const cancel = () => {
        if (controllerRef.current) {
            controllerRef.current.abort();
        }
        setLoading(false);
        setLoadingMore(false);
    };

    const mutate = (newData?: TData) => {
        setData(newData);
    };

    useEffect(() => {
        const el = getTargetElement(target);
        if (!el) return;
        targetRef.current = getScrollElement(el);
    }, [target]);

    useEffect(() => {
        const el = targetRef.current;
        if (!el) return;

        el.addEventListener('scroll', scrollMethod);
        return () => {
            el.removeEventListener('scroll', scrollMethod);
        };
    }, [loading, loadingMore, data]);

    useEffect(() => {
        if (!manual) {
            reload();
        }
    }, [...reloadDeps]);

    return {
        data,
        loading,
        loadingMore,
        error,
        noMore,
        loadMore,
        loadMoreAsync,
        reload,
        reloadAsync,
        cancel,
        mutate,
    };
}
