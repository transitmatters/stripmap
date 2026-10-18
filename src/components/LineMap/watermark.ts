import type React from 'react';

export type WatermarkPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export type WatermarkOptions = {
    content: React.ReactNode;
    position?: WatermarkPosition;
    // Inset from the chosen corner of the map container, in pixels
    offset?: { x: number; y: number };
    opacity?: number;
};

const DEFAULT_OFFSET = { x: 10, y: 10 };

export const getWatermarkStyle = (watermark: WatermarkOptions): React.CSSProperties => {
    const { position = 'bottom-right', offset = DEFAULT_OFFSET, opacity } = watermark;
    const [vertical, horizontal] = position.split('-') as ['top' | 'bottom', 'left' | 'right'];
    return {
        [vertical]: offset.y,
        [horizontal]: offset.x,
        opacity,
    };
};
