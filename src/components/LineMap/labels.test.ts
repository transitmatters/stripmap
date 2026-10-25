import { getSegmentLabelBounds, getStationLabelBounds } from './labels';

const content = () => null;

describe('getSegmentLabelBounds', () => {
    const bounds = { top: 20, left: 5, right: 7, width: 2, height: 30 };

    test('vertical labels sit to the right of the segment on side 0 and the left on side 1', () => {
        expect(getSegmentLabelBounds(bounds, { mapSide: '0', boundingSize: 12, content }, false)).toEqual({
            x: 7,
            y: 20,
            width: 12,
            height: 30,
        });
        expect(getSegmentLabelBounds(bounds, { mapSide: '1', boundingSize: 12, content }, false)).toEqual({
            x: -7,
            y: 20,
            width: 12,
            height: 30,
        });
    });

    test('horizontal labels run along the segment, above it on side 0', () => {
        expect(getSegmentLabelBounds(bounds, { mapSide: '0', boundingSize: 12, content }, true)).toEqual({
            x: 20,
            y: -19,
            width: 30,
            height: 12,
        });
        expect(getSegmentLabelBounds(bounds, { mapSide: '1', boundingSize: 12, content }, true)).toEqual({
            x: 20,
            y: -5,
            width: 30,
            height: 12,
        });
    });
});

describe('getStationLabelBounds', () => {
    const station = { x: 10, y: 50 };

    test('centers a vertical label along the line, beside the station', () => {
        expect(getStationLabelBounds(station, { mapSide: '0', content }, false)).toEqual({
            x: 10,
            y: 45,
            width: 10,
            height: 10,
        });
        expect(getStationLabelBounds(station, { mapSide: '1', boundingSize: 8, content }, false)).toEqual({
            x: 2,
            y: 45,
            width: 8,
            height: 10,
        });
    });

    test('centers a horizontal label along the line, beside the station', () => {
        expect(getStationLabelBounds(station, { mapSide: '0', length: 14, content }, true)).toEqual({
            x: 43,
            y: -20,
            width: 14,
            height: 10,
        });
        expect(getStationLabelBounds(station, { mapSide: '1', length: 14, content }, true)).toEqual({
            x: 43,
            y: -10,
            width: 14,
            height: 10,
        });
    });

    test('applies the offset', () => {
        expect(getStationLabelBounds(station, { mapSide: '0', offset: { x: 1, y: -2 }, content }, false)).toEqual({
            x: 11,
            y: 43,
            width: 10,
            height: 10,
        });
    });
});
