import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import type { SegmentRenderOptions, StationRenderOptions } from './LineMap';
import { LineMap } from './LineMap';
import { createDefaultDiagramForLine } from '../..';
import { stations as stationData } from '../../mbta/stations';

const meta: Meta = {
    title: 'LineMap',
    component: LineMap,
    render: (args) => {
        const { line, direction } = args;
        const diagram = createDefaultDiagramForLine(line);

        const lineColor = line === 'Mattapan' ? 'red' : line.toLowerCase();

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
    const greenLineSegments: SegmentRenderOptions[] = [
        {
            location: { toStationId: 'place-lech', fromStationId: 'place-unsqu' },
            strokes: [{ offset: 1, stroke: 'green', opacity: 0.6 }],
        },
        {
            location: { toStationId: 'place-esomr', fromStationId: 'place-lech' },
            strokes: [{ offset: 1, stroke: 'green', opacity: 0.6 }],
        },
        {
            location: { toStationId: 'place-prmnl', fromStationId: 'place-coecl' },
            strokes: [{ offset: 1, stroke: 'green', opacity: 0.6 }],
        },
    ];
    const greenLine = createDefaultDiagramForLine('Green', { pxPerStation: 15 });

    // Test that we can get paths between various station pairs without crashing
    const testPairs = [
        ['place-bland', 'place-kencl'], // Blandford to Kenmore (the original issue)
        ['place-kencl', 'place-bland'], // Kenmore to Blandford (reverse)
        ['place-bland', 'place-boyls'], // Blandford to Boylston (through trunk)
        ['place-boyls', 'place-kencl'], // Boylston to Kenmore (within trunk)
        ['place-buest', 'place-kencl'], // BU East to Kenmore (B branch to trunk)
        ['place-esomr', 'place-lech'], // East Somerville to Lechmere (E branch to trunk)
        ['place-unsqu', 'place-lech'], // Union Square to Lechmere (D branch to trunk)
    ];

    testPairs.forEach(([from, to]) => {
        try {
            const path = greenLine.getPathBetweenStations(from, to);
            console.log(`✅ Successfully got path between ${from} and ${to}`);
            console.log(`   Path length: ${path.length}`);
        } catch (error) {
            console.error(`❌ Failed to get path between ${from} and ${to}:`, error);
            throw error; // Re-throw to make the test fail
        }
    });

    return (
        <LineMap
            direction='horizontal'
            diagram={greenLine}
            strokeOptions={{ stroke: 'green' }}
            getSegments={() => greenLineSegments}
        />
    );
};

const abbreviateStationName = ({ stationName }: { stationName: string }) =>
    stationName
        .replace('Boston University', 'BU')
        .replace('Hynes Convention Center', 'Hynes')
        .replace('Government Center', "Gov't Center")
        .replace('Northeastern University', 'Northeastern')
        .replace('Museum of Fine Arts', 'MFA');

// Mirrors how the TransitMatters dashboard renders the Green Line: every adjacent station pair
// gets offset strokes and a label, which makes overlapping segments and labels easy to spot.
const GreenLineWithAllSegments = ({ direction }: { direction: 'horizontal' | 'vertical' }) => {
    const diagram = createDefaultDiagramForLine('Green', { pxPerStation: 15, direction });
    const segments: SegmentRenderOptions[] = diagram.getAdjacentSegmentLocations().map((location) => ({
        location,
        strokes: [
            { offset: 1, stroke: 'green', strokeWidth: 2, opacity: 0.3 },
            { offset: -1, stroke: 'green', strokeWidth: 2, opacity: 0.3 },
        ],
        labels: [
            {
                mapSide: '0',
                boundingSize: direction === 'horizontal' ? 15 : 20,
                // Same shape as the dashboard's speed labels: one line per direction, centered
                content: ({ width, height }) => (
                    <g fontSize={4} textAnchor='middle' fill='currentColor'>
                        <text x={width / 2} y={height / 2 - 1.5}>
                            ❮ 12 mph
                        </text>
                        <text x={width / 2} y={height / 2 + 4.5}>
                            14 mph ❯
                        </text>
                    </g>
                ),
            },
        ],
    }));
    return (
        <LineMap
            direction={direction}
            diagram={diagram}
            strokeOptions={{ stroke: 'green' }}
            getStationLabel={abbreviateStationName}
            getSegments={() => segments}
        />
    );
};

export const GreenLineAllSegmentsHorizontal = () => <GreenLineWithAllSegments direction='horizontal' />;

export const GreenLineAllSegmentsVertical = () => <GreenLineWithAllSegments direction='vertical' />;

export const Watermarked = () => {
    const diagram = createDefaultDiagramForLine('Orange');
    return (
        <LineMap
            direction='vertical'
            diagram={diagram}
            strokeOptions={{ stroke: 'orange' }}
            watermark={{
                position: 'bottom-right',
                opacity: 0.2,
                content: <div style={{ fontSize: 16, fontWeight: 'bold' }}>TransitMatters</div>,
            }}
        />
    );
};

const greenLineStationDetails: Record<string, { accessible: boolean }> = Object.fromEntries(
    stationData.Green.stations.map((station) => [station.station, station]),
);

// Mirrors the dashboard's station ridership map: dot size and a label show ridership at each stop,
// hovering shows details, and clicking selects a stop
const GreenLineWithStationInteraction = ({ direction }: { direction: 'horizontal' | 'vertical' }) => {
    const [selectedStationId, setSelectedStationId] = useState<null | string>(null);
    const diagram = createDefaultDiagramForLine('Green', { pxPerStation: 15, direction });
    // Made-up ridership numbers, stable from render to render
    const ridershipByStationId: Record<string, number> = Object.fromEntries(
        diagram.getStations().map((station, index) => [station.station, 500 + ((index * 7919) % 9500)]),
    );
    const maxRidership = Math.max(...Object.values(ridershipByStationId));

    const getStations = ({ isHorizontal }: { isHorizontal: boolean }): StationRenderOptions[] =>
        diagram.getStations().map(({ station: stationId }) => {
            const ridership = ridershipByStationId[stationId];
            const isSelected = stationId === selectedStationId;
            return {
                stationId,
                dot: {
                    radius: 1 + 2 * (ridership / maxRidership),
                    fill: isSelected ? 'green' : 'white',
                    strokeWidth: isSelected ? 1.5 : 1,
                },
                labels: [
                    {
                        mapSide: '0',
                        length: 15,
                        boundingSize: isHorizontal ? 8 : 14,
                        // Keep clear of the dot, which sits on the edge of the label nearest the line
                        content: ({ width, height }) => (
                            <text
                                x={isHorizontal ? width / 2 : 4}
                                y={isHorizontal ? 4 : height / 2 + 1.25}
                                fontSize={3.5}
                                textAnchor={isHorizontal ? 'middle' : 'start'}
                                fill='currentColor'
                                fontWeight={isSelected ? 'bold' : undefined}
                            >
                                {(ridership / 1000).toFixed(1)}k
                            </text>
                        ),
                    },
                ],
            };
        });

    return (
        <LineMap
            direction={direction}
            diagram={diagram}
            strokeOptions={{ stroke: 'green' }}
            getStationLabel={abbreviateStationName}
            getStations={getStations}
            onStationClick={(stationId) =>
                setSelectedStationId((current) => (current === stationId ? null : stationId))
            }
            stationTooltip={{
                render: ({ stationId, stationName, side }) => (
                    <div
                        style={{
                            // Leave the station itself visible
                            margin: side === 'top' ? '0 0 12px' : side === 'left' ? '0 12px 0 0' : '0 0 0 12px',
                            background: 'white',
                            color: '#333',
                            border: '1px solid #ccc',
                            borderRadius: 4,
                            padding: '4px 8px',
                            fontSize: 12,
                            whiteSpace: 'nowrap',
                        }}
                    >
                        <strong>{stationName}</strong>
                        <div>{ridershipByStationId[stationId].toLocaleString()} riders/day</div>
                        <div>{greenLineStationDetails[stationId]?.accessible ? '♿ Accessible' : 'Not accessible'}</div>
                    </div>
                ),
            }}
        />
    );
};

export const StationInteractionHorizontal = () => <GreenLineWithStationInteraction direction='horizontal' />;

export const StationInteractionVertical = () => <GreenLineWithStationInteraction direction='vertical' />;

// Station names and the keyboard focus ring follow the surrounding text color
export const DarkBackground = () => (
    <div style={{ background: '#1c1917', color: '#e7e5e4', padding: '48px 16px 16px' }}>
        <GreenLineWithStationInteraction direction='horizontal' />
    </div>
);

export const Main: StoryObj = { args: { line: 'Red', direction: 'horizontal' } };

export default meta;
