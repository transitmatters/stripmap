import { getWatermarkStyle } from './watermark';

describe('getWatermarkStyle', () => {
    test('defaults to the bottom-right corner with a 10px inset', () => {
        expect(getWatermarkStyle({ content: null })).toEqual({ bottom: 10, right: 10, opacity: undefined });
    });

    test('positions against the requested corner', () => {
        expect(getWatermarkStyle({ content: null, position: 'top-left' })).toEqual({
            top: 10,
            left: 10,
            opacity: undefined,
        });
    });

    test('applies a custom offset and opacity', () => {
        expect(
            getWatermarkStyle({ content: null, position: 'top-right', offset: { x: 4, y: 20 }, opacity: 0.2 }),
        ).toEqual({ top: 20, right: 4, opacity: 0.2 });
    });
});
