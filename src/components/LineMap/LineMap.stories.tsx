import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import type { SegmentRenderOptions } from './LineMap';
import { LineMap } from './LineMap';
import { createDefaultDiagramForLine } from '../..';

const meta: Meta = {
    title: 'LineMap',
    component: LineMap,
    render: (args) => {
        const { line, direction } = args;
        const diagram = createDefaultDiagramForLine(line);

        const lineColor = line === 'Mattapan' ? 'red': line.toLowerCase();

        return (
            <>
                <LineMap
                    direction={direction}
                    diagram={diagram}
                    getStationLabel={(options) => options.stationId}
                    strokeOptions={{ stroke: lineColor }}
                    getSegments={() => []}
                />
            </>
        );
    },
    argTypes: {
        line: {
            options: ['Red', 'Green', 'Orange', 'Blue', 'Mattapan'],
            defaultValue: 'Red',
            control: { type: 'radio' },
        },
        direction: { options: ['horizontal', 'vertical'], defaultValue: 'horizontal', control: { type: 'radio' } },
        diagram: { control: { disable: true } },
        getSegments: { control: { disable: true } },
        segments: { control: { disable: true }, defaultValue: [] },
    },
};

export const RedLine = () => {
    const diagram = createDefaultDiagramForLine('Red');
    const redLineSegments: SegmentRenderOptions[] = [
        {
            location: { toStationId: 'place-cntsq', fromStationId: 'place-pktrm' },
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
                    content: () => (
                        <div style={{ fontSize: 4 }}>And on this side too! I also like being on this side!</div>
                    ),
                },
            ],
        },
        {
            location: { toStationId: 'place-pktrm', fromStationId: 'place-shmnl' },
            strokes: [
                { offset: 1, stroke: 'red', opacity: 0.3 },
                { offset: 2, stroke: 'red', opacity: 0.6 },
                { offset: 3, stroke: 'red', opacity: 0.8 },
            ],
        },
    ];

    return (
        <LineMap
            direction='horizontal'
            diagram={diagram}
            getStationLabel={(options) => options.stationId}
            strokeOptions={{ stroke: 'red' }}
            getSegments={() => redLineSegments}
        />
    );
};

export const GreenLine = () => {
    const greenLineSegments: SegmentRenderOptions[] = [];
    const greenLine = createDefaultDiagramForLine('Green');

    return (
        <LineMap
            direction='horizontal'
            diagram={greenLine}
            strokeOptions={{ stroke: 'green' }}
            getSegments={() => greenLineSegments}
        />
    );
};

export const Main: StoryObj = { args: { line: 'Red', direction: 'horizontal' } };

export default meta;
