import { act, renderHook } from '@testing-library/react';
import { useState } from 'react';
import { sleep } from '../utils/testingHelpers';
import useInfiniteScroll from './index.tsx';
import type { Data, InfiniteScrollOptions, Service } from './types';

let count = 0;
export async function mockRequest() {
    await sleep(1000);
    if (count >= 1) {
        return { list: [4, 5, 6] };
    }
    count++;
    return {
        list: [1, 2, 3],
        nextId: count,
    };
}

const targetEl = document.createElement('div');

// 타겟 엘리먼트의 속성 설정 헬퍼 함수
function setTargetInfo(key: 'scrollTop', value) {
    Object.defineProperty(targetEl, key, {
        value,
        configurable: true,
    });
}

const setup = <T extends Data>(service: Service<T>, options?: InfiniteScrollOptions<T>) =>
    renderHook(() => useInfiniteScroll(service, options));

describe('useInfiniteScroll 훅 테스트', () => {
    beforeEach(() => {
        count = 0;
    });

    beforeAll(() => {
        jest.useFakeTimers();
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it('초기 로딩이 자동으로 시작되어야 한다', async () => {
        const { result } = setup(mockRequest);
        expect(result.current.loading).toBe(true);
        await act(async () => {
            jest.advanceTimersByTime(1000);
        });
        expect(result.current.loading).toBe(false);
    });

    it('추가 로딩 기능이 정상적으로 동작해야 한다', async () => {
        const { result } = setup(mockRequest, { manual: true });
        const { loadMore, loading } = result.current;
        expect(loading).toBe(false);
        act(() => {
            loadMore();
        });
        expect(result.current.loadingMore).toBe(true);
        await act(async () => {
            jest.advanceTimersByTime(1000);
        });
        expect(result.current.loadingMore).toBe(false);
    });

    it('더 이상 데이터가 없을 때 noMore가 true여야 한다', async () => {
        const { result } = setup(mockRequest, {
            isNoMore: (d) => d?.nextId === undefined,
        });
        const { loadMore } = result.current;
        await act(async () => {
            jest.advanceTimersByTime(1000);
        });

        expect(result.current.noMore).toBe(false);
        act(() => loadMore());
        await act(async () => {
            jest.advanceTimersByTime(1000);
        });
        expect(result.current.noMore).toBe(true);
    });

    it('스크롤이 바닥에 도달하면 자동으로 추가 로딩되어야 한다', async () => {
        const events = {};
        const mockAddEventListener = jest
            .spyOn(targetEl, 'addEventListener')
            .mockImplementation((eventName, callback) => {
                events[eventName] = callback;
            });
        const { result } = setup(mockRequest, {
            target: targetEl,
            isNoMore: (d) => d?.nextId === undefined,
        });

        // 로딩 중일 때는 동작하지 않아야 함
        expect(result.current.loading).toBe(true);
        events['scroll']();
        await act(async () => {
            jest.advanceTimersByTime(1000);
        });
        expect(result.current.loading).toBe(false);

        const scrollHeightSpy = jest.spyOn(targetEl, 'scrollHeight', 'get').mockImplementation(() => 150);
        const clientHeightSpy = jest.spyOn(targetEl, 'clientHeight', 'get').mockImplementation(() => 300);
        setTargetInfo('scrollTop', 100);

        act(() => {
            events['scroll']();
        });
        expect(result.current.loadingMore).toBe(true);
        await act(async () => {
            jest.advanceTimersByTime(1000);
        });
        expect(result.current.loadingMore).toBe(false);

        // 더 이상 데이터가 없을 때는 동작하지 않아야 함
        expect(result.current.noMore).toBe(true);
        act(() => {
            events['scroll']();
        });
        expect(result.current.loadingMore).toBe(false);

        // 데이터가 순서대로 로드되어야 함
        expect(result.current.data?.list).toMatchObject([1, 2, 3, 4, 5, 6]);

        mockAddEventListener.mockRestore();
        scrollHeightSpy.mockRestore();
        clientHeightSpy.mockRestore();
    });

    it('스크롤이 최상단에 도달하면 자동으로 추가 로딩되어야 한다', async () => {
        const events = {};
        const mockAddEventListener = jest
            .spyOn(targetEl, 'addEventListener')
            .mockImplementation((eventName, callback) => {
                events[eventName] = callback;
            });

        Object.defineProperty(targetEl, 'scrollTo', {
            value: (x: number, y: number) => {
                setTargetInfo('scrollTop', y);
            },
            writable: true,
        });

        const { result } = setup(mockRequest, {
            target: targetEl,
            direction: 'top',
            isNoMore: (d) => d?.nextId === undefined,
        });

        // 로딩 중일 때는 동작하지 않아야 함
        expect(result.current.loading).toBe(true);
        events['scroll']();
        await act(async () => {
            jest.advanceTimersByTime(1000);
        });
        expect(result.current.loading).toBe(false);

        // 첫 번째 스크롤 모의
        const scrollHeightSpy = jest.spyOn(targetEl, 'scrollHeight', 'get').mockImplementation(() => 150);
        const clientHeightSpy = jest.spyOn(targetEl, 'clientHeight', 'get').mockImplementation(() => 500);
        setTargetInfo('scrollTop', 300);

        act(() => {
            events['scroll']();
        });
        // 위로 스크롤 모의
        setTargetInfo('scrollTop', 50);

        act(() => {
            events['scroll']();
        });

        expect(result.current.loadingMore).toBe(true);
        await act(async () => {
            jest.advanceTimersByTime(1000);
        });
        expect(result.current.loadingMore).toBe(false);

        // 역순으로 데이터가 로드되어야 함
        expect(result.current.data?.list).toMatchObject([4, 5, 6, 1, 2, 3]);

        // 더 이상 데이터가 없을 때는 동작하지 않아야 함
        expect(result.current.noMore).toBe(true);
        act(() => {
            events['scroll']();
        });
        expect(result.current.loadingMore).toBe(false);

        mockAddEventListener.mockRestore();
        scrollHeightSpy.mockRestore();
        clientHeightSpy.mockRestore();
    });

    it('새로고침이 정상적으로 동작해야 한다', async () => {
        const fn = jest.fn(() => Promise.resolve({ list: [] }));
        const { result } = setup(fn);
        const { reload } = result.current;
        expect(fn).toBeCalledTimes(1);
        act(() => reload());
        expect(fn).toBeCalledTimes(2);
        await act(async () => {
            Promise.resolve();
        });
    });

    it('reloadDeps가 변경되면 새로고침이 트리거되어야 한다', async () => {
        const fn = jest.fn(() => Promise.resolve({ list: [] }));
        const { result } = renderHook(() => {
            const [value, setValue] = useState('');
            const res = useInfiniteScroll(fn, {
                reloadDeps: [value],
            });
            return {
                ...res,
                setValue,
            };
        });
        expect(fn).toBeCalledTimes(1);
        act(() => {
            result.current.setValue('ahooks');
        });
        expect(fn).toBeCalledTimes(2);
        await act(async () => {
            Promise.resolve();
        });
    });

    it('새로고침 시 최신 데이터를 반영해야 한다', async () => {
        let listCount = 5;
        const mockRequestFn = async () => {
            await sleep(1000);
            return {
                list: Array.from({
                    length: listCount,
                }).map((_, index) => index + 1),
                nextId: listCount,
                hasMore: listCount > 2,
            };
        };

        const { result } = setup(mockRequestFn);

        await act(async () => {
            jest.advanceTimersByTime(1000);
        });
        expect(result.current.data).toMatchObject({ list: [1, 2, 3, 4, 5], nextId: 5 });

        listCount = 3;
        await act(async () => {
            result.current.reload();
            jest.advanceTimersByTime(1000);
        });

        expect(result.current.data).toMatchObject({ list: [1, 2, 3], nextId: 3 });
    });

    it('데이터 변경이 정상적으로 동작해야 한다', async () => {
        const { result } = setup(mockRequest);
        const { mutate } = result.current;
        await act(async () => {
            jest.advanceTimersByTime(1000);
        });
        expect(result.current.data).toMatchObject({ list: [1, 2, 3], nextId: 1 });
        const newData = {
            list: [1, 2],
            nextId: 1,
        };
        act(() => mutate(newData));
        expect(result.current.data).toMatchObject(newData);
    });

    it('취소 기능이 정상적으로 동작해야 한다', () => {
        const onSuccess = jest.fn();
        const { result } = setup(mockRequest, {
            onSuccess,
        });
        const { cancel } = result.current;
        expect(result.current.loading).toBe(true);
        act(() => cancel());
        expect(result.current.loading).toBe(false);
        expect(onSuccess).not.toBeCalled();
    });

    it('onBefore/onSuccess/onFinally 콜백이 순서대로 호출되어야 한다', async () => {
        const onBefore = jest.fn();
        const onSuccess = jest.fn();
        const onFinally = jest.fn();
        const { result } = setup(mockRequest, {
            onBefore,
            onSuccess,
            onFinally,
        });
        await act(async () => {
            jest.advanceTimersByTime(1000);
        });
        expect(onBefore).toBeCalled();
        expect(onSuccess).toBeCalled();
        expect(onFinally).toBeCalled();
    });

    it('에러 발생 시 onError가 호출되어야 한다', async () => {
        const onError = jest.fn();
        const mockRequestError = () => {
            return Promise.reject('error');
        };
        setup(mockRequestError, {
            onError,
        });
        await act(async () => {
            Promise.resolve();
        });
        expect(onError).toBeCalled();
    });

    it('비동기 추가 로딩이 정상적으로 동작해야 한다', async () => {
        const { result } = setup(mockRequest, {
            manual: true,
        });
        const { loadMoreAsync } = result.current;
        act(() => {
            loadMoreAsync().then((res) => {
                expect(res).toMatchObject({ list: [1, 2, 3], nextId: 1 });
                expect(result.current.loading).toBe(false);
            });
        });
        await act(async () => {
            jest.advanceTimersByTime(1000);
        });
    });

    it('비동기 새로고침이 정상적으로 동작해야 한다', async () => {
        const fn = jest.fn(() => Promise.resolve({ list: [] }));
        const { result } = setup(fn);
        const { reloadAsync } = result.current;
        expect(fn).toBeCalledTimes(1);

        act(() => {
            reloadAsync().then(() => {
                expect(fn).toBeCalledTimes(2);
            });
        });
        await act(async () => {
            Promise.resolve();
        });
    });

    it('추가 로딩 후 새로고침 시 로딩 상태가 true여야 한다', async () => {
        const { result } = setup(mockRequest);
        expect(result.current.loading).toBeTruthy();
        const { reload, loadMore } = result.current;
        await act(async () => {
            jest.advanceTimersByTime(1000);
        });

        expect(result.current.loading).toBeFalsy();

        act(() => {
            loadMore();
            reload();
        });
        expect(result.current.loading).toBeTruthy();

        await act(async () => {
            jest.advanceTimersByTime(1000);
        });

        expect(result.current.loading).toBeFalsy();
    });

    it('추가 로딩 후 비동기 새로고침 시 로딩 상태가 true여야 한다', async () => {
        const { result } = setup(mockRequest);
        expect(result.current.loading).toBeTruthy();
        const { reloadAsync, loadMore } = result.current;
        await act(async () => {
            jest.advanceTimersByTime(1000);
        });

        expect(result.current.loading).toBeFalsy();

        act(() => {
            loadMore();
            reloadAsync();
        });
        expect(result.current.loading).toBeTruthy();

        await act(async () => {
            jest.advanceTimersByTime(1000);
        });

        expect(result.current.loading).toBeFalsy();
    });

    it('리스트가 null 또는 undefined일 수 있다', async () => {
        // @ts-ignore
        const { result } = setup(async function () {
            await sleep(1000);
            count++;
            return {
                list: Math.random() < 0.5 ? null : undefined,
                nextId: count,
            };
        });

        expect(result.current.loading).toBeTruthy();

        const { loadMore } = result.current;
        await act(async () => {
            jest.advanceTimersByTime(1000);
        });

        expect(result.current.loading).toBeFalsy();

        act(() => {
            loadMore();
        });
    });

    it('에러 결과를 반환해야 한다', async () => {
        const { result } = setup(async () => {
            throw new Error('에러 메시지');
        });
        await act(async () => {
            jest.advanceTimersByTime(1000);
        });

        expect(result.current.error?.message).toBe('에러 메시지');
    });
});
