import React from 'react';

import type { SegmentRenderOptions } from './LineMap';
import { LineMap } from './LineMap';
import { createDefaultDiagramForLine } from '../..';

export default {
    title: 'LineMap',
    component: LineMap,
};

const redLine = createDefaultDiagramForLine('Red');
const greenLine = createDefaultDiagramForLine('Green');
const redLineSegments: SegmentRenderOptions[] = [
    {
        location: {
            toStationId: 'place-cntsq',
            fromStationId: 'place-pktrm',
        },
        strokes: [
            { offset: 1, stroke: 'red', opacity: 0.1 },
            { offset: -1, stroke: 'red', opacity: 0.3 },
            { offset: -2, stroke: 'red', opacity: 0.6 },
            { offset: -3, stroke: 'red', opacity: 0.8 },
        ],
        labels: [
            {
                mapSide: '0',
                boundingSize: 40,
                content: () => (
                    <div style={{ fontSize: 4 }}>Greetings amigos thank you for inviting me into your SVG</div>
                ),
            },
            {
                mapSide: '1',
                boundingSize: 40,
                content: () => <div style={{ fontSize: 4 }}>And on this side too! I also like being on this side!</div>,
            },
        ],
    },
    {
        location: {
            toStationId: 'place-pktrm',
            fromStationId: 'place-shmnl',
        },
        strokes: [
            { offset: 1, stroke: 'red', opacity: 0.3 },
            { offset: 2, stroke: 'red', opacity: 0.6 },
            { offset: 3, stroke: 'red', opacity: 0.8 },
        ],
    },
];

const greenLineSegments: SegmentRenderOptions[] = [];

export const Main = () => {
    return (
        <>
            <LineMap
                direction='horizontal'
                diagram={greenLine}
                strokeOptions={{ stroke: 'green' }}
                getSegments={() => greenLineSegments}
            />

            <LineMap
                direction='horizontal'
                diagram={redLine}
                getStationLabel={(options) => options.stationId}
                strokeOptions={{ stroke: 'red' }}
                getSegments={() => redLineSegments}
            />
        </>
    );
};
