import type React from 'react';

import type { Point } from '../../diagrams';

export type MapSide = '0' | '1';

export type Rect = {
    top: number;
    left: number;
    right: number;
    width: number;
    height: number;
};

export type SegmentLabel = {
    mapSide: MapSide;
    boundingSize?: number;
    offset?: { x: number; y: number };
    content: (size: { width: number; height: number }) => React.ReactNode;
};

export type StationLabel = SegmentLabel & {
    /** How far the label extends along the line, centered on the station */
    length?: number;
};

const DEFAULT_STATION_LABEL_LENGTH = 10;

export const getSegmentLabelBounds = (segmentBounds: Rect, segmentLabel: SegmentLabel, isHorizontal: boolean) => {
    const { top, left, right, width, height } = segmentBounds;
    const { boundingSize = 10, offset: providedOffset, mapSide } = segmentLabel;
    const offset = providedOffset || { x: 0, y: 0 };
    if (isHorizontal) {
        const moveAcross = mapSide === '0';
        return {
            x: top + offset.x,
            y: 0 - left - (moveAcross ? boundingSize + width : 0) + offset.y,
            width: height,
            height: boundingSize,
        } as const;
    }
    const moveAcross = mapSide === '1';
    return {
        x: right - (moveAcross ? boundingSize + width : 0) + offset.x,
        y: top + offset.y,
        height,
        width: boundingSize,
    };
};

// Treat the station as a zero-width stretch of line centered on it, so station labels
// follow the same mapSide and offset rules as segment labels
export const getStationLabelBounds = (stationPosition: Point, stationLabel: StationLabel, isHorizontal: boolean) => {
    const { length = DEFAULT_STATION_LABEL_LENGTH } = stationLabel;
    const { x, y } = stationPosition;
    const bounds = { top: y - length / 2, left: x, right: x, width: 0, height: length };
    return getSegmentLabelBounds(bounds, stationLabel, isHorizontal);
};
