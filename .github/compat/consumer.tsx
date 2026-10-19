// Type-checks the published declarations against the installed @types/react.
// Compiled with `tsc --noEmit` only; never run.

import React from 'react';
import {
    LineMap,
    createDefaultDiagramForLine,
    createRedLineDiagram,
    type DiagrammableLineName,
    type LineMapProps,
    type SegmentRenderOptions,
} from '@transitmatters/stripmap';

const lineName: DiagrammableLineName = 'Orange';

const getSegments: LineMapProps['getSegments'] = ({ isHorizontal }): SegmentRenderOptions[] => [
    {
        location: { fromStationId: 'place-alfcl', toStationId: 'place-jfk' },
        strokes: [{ stroke: 'red', strokeWidth: isHorizontal ? 2 : 4 }],
        labels: [{ mapSide: '0', content: ({ width }) => <span>{width}</span> }],
    },
];

export const RedLine = () => (
    <LineMap
        diagram={createRedLineDiagram()}
        direction='horizontal'
        getSegments={getSegments}
        getStationLabel={({ stationName }) => stationName}
        tooltip={{ render: ({ side }) => <div>{side}</div> }}
    />
);

export const DefaultLine = (): React.ReactElement => <LineMap diagram={createDefaultDiagramForLine(lineName)} />;
