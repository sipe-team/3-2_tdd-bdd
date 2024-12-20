export class TextEncoderPolyfill {
    encoding = 'utf-8'; // readonly property 추가

    encode(str: string): Uint8Array {
        const arr = new Uint8Array(str.length);
        for (let i = 0; i < str.length; i++) {
            arr[i] = str.charCodeAt(i);
        }
        return arr;
    }

    encodeInto(source: string, destination: Uint8Array): TextEncoderEncodeIntoResult {
        const encoded = this.encode(source);
        const len = Math.min(encoded.length, destination.length);
        destination.set(encoded.subarray(0, len));
        return {
            read: len,
            written: len,
        };
    }
}

export class TextDecoderPolyfill {
    encoding = 'utf-8'; // readonly property 추가
    fatal = false;
    ignoreBOM = false;

    decode(arr: BufferSource): string {
        if (arr instanceof Uint8Array) {
            return String.fromCharCode.apply(null, Array.from(arr));
        }
        const view = new Uint8Array(arr instanceof ArrayBuffer ? arr : arr.buffer);
        return String.fromCharCode.apply(null, Array.from(view));
    }
}

if (typeof global.TextEncoder === 'undefined') {
    global.TextEncoder = TextEncoderPolyfill as unknown as typeof TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
    global.TextDecoder = TextDecoderPolyfill as unknown as typeof TextDecoder;
}
