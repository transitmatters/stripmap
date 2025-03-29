import React from 'react';

import type { SegmentRenderOptions } from './LineMap';
import { LineMap } from './LineMap';
import { createDefaultDiagramForLine } from '../..';
import type { Vehicle } from '../../diagrams';

export default {
    title: 'LineMap',
    component: LineMap,
};

const redLine = createDefaultDiagramForLine('Red');
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

export const Main = () => {
    return (
        <>
            <LineMap
                direction='horizontal'
                diagram={redLine}
                getStationLabel={(options) => options.stationId}
                strokeOptions={{ stroke: 'red' }}
                getSegments={() => redLineSegments}
            />
            <LineMap
                direction='vertical'
                diagram={redLine}
                getStationLabel={(options) => options.stationId}
                strokeOptions={{ stroke: 'red' }}
                getSegments={() => redLineSegments}
            />
        </>
    );
};

// Sample vehicles for the Red Line
const redLineVehicles: Vehicle[] = [
    {
        id: 'train-1',
        fromStationId: 'place-pktrm',
        toStationId: 'place-cntsq',
        position: 0.3,
        direction: 'outbound',
    },
    {
        id: 'train-2',
        fromStationId: 'place-shmnl',
        toStationId: 'place-pktrm',
        position: 0.7,
        direction: 'inbound',
    },
    {
        id: 'train-3',
        fromStationId: 'place-cntsq',
        toStationId: 'place-harsq',
        position: 0.5,
        direction: 'outbound',
    },
];

export const WithVehicles = () => {
    return (
        <>
            <h3>Horizontal Line Map with Vehicles</h3>
            <LineMap
                direction='horizontal'
                diagram={redLine}
                getStationLabel={(options) => options.stationId}
                strokeOptions={{ stroke: 'red' }}
                getSegments={() => redLineSegments}
                vehicles={redLineVehicles}
                vehicleOptions={{ size: 4 }}
            />
            <h3>Vertical Line Map with Vehicles</h3>
            <LineMap
                direction='vertical'
                diagram={redLine}
                getStationLabel={(options) => options.stationId}
                strokeOptions={{ stroke: 'red' }}
                getSegments={() => redLineSegments}
                vehicles={redLineVehicles}
                vehicleOptions={{ size: 4 }}
            />
        </>
    );
};
