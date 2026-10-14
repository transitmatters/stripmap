import { line } from './commands';
import { Diagram } from './diagram';
import { execute } from './execute';
import type { Station, Turtle } from './types';

export type StraightLineDiagramOptions = {
    /** Number of pixels between each station */
    pxPerStation?: number;
};

const DEFAULT_PX_PER_STATION = 10;

/**
 * Creates a diagram of a single straight line with evenly spaced stations, for lines whose
 * shape we don't know or don't need to draw precisely (e.g. bus routes or commuter rail lines).
 * Stations are placed along the line in the order they are given.
 */
export const createStraightLineDiagram = (stations: Station[], options: StraightLineDiagramOptions = {}) => {
    const { pxPerStation = DEFAULT_PX_PER_STATION } = options;
    if (stations.length === 0) {
        throw new Error('Cannot create a straight line diagram without any stations');
    }
    const seenStationIds = new Set<string>();
    for (const { station } of stations) {
        if (seenStationIds.has(station)) {
            throw new Error(`Station ids must be unique within a diagram, but ${station} appears more than once`);
        }
        seenStationIds.add(station);
    }
    const start: Turtle = { x: 0, y: 0, theta: 90 };
    const path = execute({
        start,
        ranges: ['main'],
        commands: [line(pxPerStation * stations.length)],
    });
    return new Diagram([path], { main: stations });
};
