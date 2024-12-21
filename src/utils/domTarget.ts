import type { MutableRefObject } from 'react';
import { isFunction } from './index';
import isBrowser from './isBrowser';

type TargetValue<T> = T | undefined | null;
type TargetType = HTMLElement | Element | Window | Document;

export type BasicTarget<T extends TargetType = Element> =
    | (() => TargetValue<T>)
    | TargetValue<T>
    | MutableRefObject<TargetValue<T>>;

export function getTargetElement<T extends TargetType>(target: BasicTarget<T>, defaultElement?: T) {
    if (!isBrowser) {
        return undefined;
    }

    if (!target) {
        return defaultElement;
    }

    let targetElement: TargetValue<T>;

    if (isFunction(target)) {
        targetElement = target();
    } else if ('current' in target) {
        targetElement = target.current;
    } else {
        targetElement = target;
    }

    return targetElement;
}

export function getScrollElement(element: Element | Document): HTMLElement | Document {
    if (!element) {
        return document;
    }

    if (element === document || element === document.documentElement || element === document.body) {
        return document;
    }

    return element as HTMLElement;
}
