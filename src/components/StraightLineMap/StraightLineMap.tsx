import React, { useMemo } from 'react';

import { createStraightLineDiagram } from '../../diagrams';
import type { Station } from '../../diagrams';
import { LineMap } from '../LineMap';
import type { LineMapProps } from '../LineMap';

export interface StraightLineMapProps extends Omit<LineMapProps, 'diagram'> {
    /** Stations to render, in order along the line */
    stations: Station[];
    /** Stroke color of the line and station dots */
    color: string;
    /** Number of pixels between each station */
    pxPerStation?: number;
}

export const StraightLineMap = (props: StraightLineMapProps) => {
    const { stations, color, pxPerStation, strokeOptions, ...lineMapProps } = props;

    const diagram = useMemo(() => createStraightLineDiagram(stations, { pxPerStation }), [stations, pxPerStation]);

    return <LineMap {...lineMapProps} diagram={diagram} strokeOptions={{ ...strokeOptions, stroke: color }} />;
};
