import React from 'react';

import type { VehicleRenderOptions } from '../LineMap/LineMap';

export const VehicleMarker = ({ size = 3, stroke = 'black', strokeWidth = 0.5 }: VehicleRenderOptions) => {
    const triangleHeight = size * 1.2;
    const triangleWidth = size * 0.9;

    const trianglePoints = `0,${-triangleHeight / 2} ${-triangleWidth / 2},${triangleHeight / 2} ${triangleWidth / 2},${triangleHeight / 2}`;

    return (
        <>
            <circle
                cx={0}
                cy={0}
                r={size}
                fill='white'
                stroke={stroke}
                strokeWidth={strokeWidth}
                filter='url(#vehicle-drop-shadow)'
            />
            <polygon points={trianglePoints} fill='black' />
        </>
    );
};
