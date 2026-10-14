import { curve, line, wiggle } from '../diagrams/commands';
import { Diagram } from '../diagrams/diagram';
import { execute } from '../diagrams/execute';
import type { Command, Point, StationDetails, Turtle } from '../diagrams/types';

import { stations } from './stations';

export type DiagrammableLineName = 'Red' | 'Green' | 'Orange' | 'Blue' | 'Mattapan';

type CreateDiagramOptions = {
    /** Number of pixels between each station */
    pxPerStation?: number;
    /**
     * Which way the diagram will be drawn by LineMap. Lines with branches can use this to lay
     * themselves out around the station labels, which hang off at a different angle in each direction.
     */
    direction?: 'horizontal' | 'vertical';
};

const DEFAULT_PX_PER_STATION = 10;

const getStationsForLine = (line: DiagrammableLineName, branch?: string): StationDetails[] => {
    const stationsForLine = stations[line].stations;
    return stationsForLine
        .filter((station) => !branch || !station.branches || station.branches?.includes(branch))
        .sort((a, b) => a.order - b.order);
};

export const createRedLineDiagram = (options: CreateDiagramOptions = {}) => {
    const { pxPerStation = DEFAULT_PX_PER_STATION } = options;
    const start: Turtle = { x: 0, y: 0, theta: 90 };
    const stationsA = getStationsForLine('Red', 'A');
    const stationsB = getStationsForLine('Red', 'B');
    const splitIndex = stationsA.findIndex((station) => station.station === 'place-jfk');
    const stationsTrunk = stationsA.slice(0, splitIndex + 1);
    const stationsABranch = stationsA.slice(splitIndex + 1);
    const stationsBBranch = stationsB.slice(splitIndex + 1);
    const trunk = line(pxPerStation * (1 + stationsTrunk.length), ['trunk']);
    const pathA = execute({
        start,
        ranges: ['branch-a'],
        commands: [
            trunk,
            wiggle(15, -20),
            line(10),
            line(pxPerStation * stationsABranch.length, ['branch-a-stations']),
        ],
    });
    const pathB = execute({
        start,
        ranges: ['branch-b'],
        commands: [trunk, wiggle(15, 20), line(60), line(pxPerStation * stationsBBranch.length, ['branch-b-stations'])],
    });
    return new Diagram([pathA, pathB], {
        trunk: stationsTrunk,
        'branch-a-stations': stationsABranch,
        'branch-b-stations': stationsBBranch,
    });
};

const d2r = (degrees: number) => degrees * (Math.PI / 180);

type GreenLineDiagramOptions = CreateDiagramOptions & {
    /** Distance between the parallel branches, overriding the default for the direction */
    branchSpacing?: number;
};

/** A sideways shift between rows. Corner sizes are in units of pxPerStation. */
type Crossing = { angle: number; corners: [number, number] };

type GreenLineLayout = {
    /** Distance between parallel branches. Station labels and segment labels share this gap. */
    branchSpacing: number;
    /** How each branch crosses between rows */
    crossings: { b: Crossing; c: Crossing; eToCopley: Crossing; dToUnion: Crossing };
    /**
     * Length, in stations, of the straight segments beside a junction. They're long enough that the
     * branch curving in or out alongside them doesn't cut through their labels.
     */
    approaches: { fenwayToKenmore: number; hynesToCopley: number; lechmereToEastSomerville: number };
};

const GREEN_LINE_LAYOUTS: Record<'horizontal' | 'vertical', GreenLineLayout> = {
    // Station labels hang down and to the left at 45 degrees
    horizontal: {
        branchSpacing: 50,
        crossings: {
            // B comes into Kenmore steeper and tighter than C, so the two stay apart
            b: { angle: 60, corners: [1.25, 0.6] },
            c: { angle: 40, corners: [1.25, 1.25] },
            // Copley's label hangs right where E comes up from, so E climbs straight up into Copley
            eToCopley: { angle: 90, corners: [1.25, 0.1] },
            dToUnion: { angle: 45, corners: [0.66, 1] },
        },
        approaches: { fenwayToKenmore: 5, hynesToCopley: 1, lechmereToEastSomerville: 4 },
    },
    // Station labels run straight out to the left
    vertical: {
        branchSpacing: 65,
        crossings: {
            b: { angle: 60, corners: [1.25, 0.6] },
            c: { angle: 40, corners: [1.25, 1.25] },
            // E comes in from the left, so it has to pass between Hynes's and Copley's labels
            eToCopley: { angle: 45, corners: [1.25, 0.6] },
            dToUnion: { angle: 45, corners: [0.66, 1] },
        },
        approaches: { fenwayToKenmore: 6, hynesToCopley: 2, lechmereToEastSomerville: 4 },
    },
};

/**
 * Shift sideways by `width` with a straight diagonal at `angle` degrees, rounding off the corners
 * at either end with curves whose chords are `startCorner` and `endCorner`. Positive widths move
 * toward +x.
 */
const bend = (width: number, angle: number, startCorner: number, endCorner: number): Command[] => {
    const direction = Math.sign(width);
    const cornersWidth = (startCorner + endCorner) * Math.sin(d2r(angle / 2));
    const diagonal = (Math.abs(width) - cornersWidth) / Math.sin(d2r(angle));
    if (diagonal < 0) {
        throw new Error(`Corners of ${startCorner} and ${endCorner} are too big for a bend of width ${width}`);
    }
    return [curve(startCorner, -direction * angle), line(diagonal), curve(endCorner, direction * angle)];
};

/** How far a list of commands moves the turtle when it starts out heading in +y. */
const measure = (commands: Command[]) => {
    const path = execute({ start: { x: 0, y: 0, theta: 90 }, commands });
    return path.getPointFromDisplacement(path.length);
};

const stationsBetween = (stations: StationDetails[], fromId: string | null, toId: string | null) => {
    const fromIndex = fromId ? stations.findIndex((s) => s.station === fromId) : 0;
    const toIndex = toId ? stations.findIndex((s) => s.station === toId) : stations.length - 1;
    return stations.slice(fromIndex, toIndex + 1);
};

/**
 * The Green Line is laid out like the MBTA's own strip maps, with the branches running parallel to
 * each other. A straight spine runs from Riverside, through the central subway, to Medford/Tufts.
 * B and C curve down into it at Kenmore, E curves up into it at Copley, and Union Square curves off
 * it after Lechmere.
 *
 *   B  o-o-o-o-o-o-o-o-o-o-o-o-o-o-o-o-.                                    .--o Union Sq
 *   C        o-o-o-o-o-o-o-o-o-o-o-o-o-.\                                  /
 *   D        o-o-o-o-o-o-o-o-o-o-o-o-o---o-o-o-o-o-o-o-o-o-o-o-o-o-------o-o-o-o-o Medford/Tufts
 *   E                     o-o-o-o-o-o-o-o-o-o-o-'  Kenmore  Copley    Lechmere
 *
 * Within every station range, stations are exactly pxPerStation apart.
 */
export const createGreenLineDiagram = (options: GreenLineDiagramOptions = {}) => {
    const { pxPerStation = DEFAULT_PX_PER_STATION, direction = 'horizontal' } = options;
    const { crossings, approaches, ...layout } = GREEN_LINE_LAYOUTS[direction];
    const { branchSpacing = layout.branchSpacing } = options;
    const stationRange = (stations: StationDetails[], name: string) =>
        line(pxPerStation * (stations.length - 1), [name]);
    const cross = (width: number, { angle, corners: [start, end] }: Crossing) =>
        bend(width, angle, start * pxPerStation, end * pxPerStation);

    // Every branch is listed from its western terminus toward Medford/Union Square
    const stationsB = getStationsForLine('Green', 'B').reverse();
    const stationsC = getStationsForLine('Green', 'C').reverse();
    const stationsD = getStationsForLine('Green', 'D').reverse();
    const stationsE = getStationsForLine('Green', 'E').reverse();

    const branchB = stationsBetween(stationsB, null, 'place-bland');
    const branchC = stationsBetween(stationsC, null, 'place-smary');
    const branchDSouth = stationsBetween(stationsD, null, 'place-fenwy');
    const branchDNorth = stationsBetween(stationsD, 'place-unsqu', null);
    const branchESouth = stationsBetween(stationsE, null, 'place-prmnl');
    const branchENorth = stationsBetween(stationsE, 'place-esomr', null);
    const trunkWest = stationsBetween(stationsD, 'place-kencl', 'place-hymnl');
    const trunk = stationsBetween(stationsE, 'place-coecl', 'place-lech');

    // Kenmore and Hynes, then Copley to Lechmere, which the E branch shares
    const sharedFromKenmore = [
        stationRange(trunkWest, 'trunk-west'),
        line(approaches.hynesToCopley * pxPerStation),
        stationRange(trunk, 'trunk'),
    ];

    const approachB = [stationRange(branchB, 'branch-b'), ...cross(-2 * branchSpacing, crossings.b)];
    // C's last segment starts with a straight run, so its label can sit clear of B
    const approachC = [stationRange(branchC, 'branch-c'), line(pxPerStation), ...cross(-branchSpacing, crossings.c)];
    const approachD = [stationRange(branchDSouth, 'branch-d-south'), line(approaches.fenwayToKenmore * pxPerStation)];
    // Likewise, E's last segment before Copley starts with a straight run for its label
    const approachE = [
        stationRange(branchESouth, 'branch-e-south'),
        line(2 * pxPerStation),
        ...cross(branchSpacing, crossings.eToCopley),
    ];

    const kenmore = { x: 0, y: 0 };
    const copley = { x: 0, y: measure(sharedFromKenmore.slice(0, 2)).y };
    const startFor = (approach: Command[], junction: Point): Turtle => {
        const { x, y } = measure(approach);
        return { x: junction.x - x, y: junction.y - y, theta: 90 };
    };

    const pathB = execute({ start: startFor(approachB, kenmore), commands: [...approachB, ...sharedFromKenmore] });
    const pathC = execute({ start: startFor(approachC, kenmore), commands: [...approachC, ...sharedFromKenmore] });
    const pathD = execute({
        start: startFor(approachD, kenmore),
        commands: [
            ...approachD,
            ...sharedFromKenmore,
            ...cross(0.8 * branchSpacing, crossings.dToUnion),
            line(2 * pxPerStation, ['branch-d-north']),
        ],
    });
    const pathE = execute({
        start: startFor(approachE, copley),
        commands: [
            ...approachE,
            stationRange(trunk, 'trunk'),
            line(approaches.lechmereToEastSomerville * pxPerStation),
            stationRange(branchENorth, 'branch-e-north'),
        ],
    });

    return new Diagram(
        [pathB, pathC, pathD, pathE],
        {
            'branch-b': branchB,
            'branch-c': branchC,
            'branch-d-south': branchDSouth,
            'branch-d-north': branchDNorth,
            'branch-e-south': branchESouth,
            'branch-e-north': branchENorth,
            'trunk-west': trunkWest,
            trunk,
        },
        { anchorLabelsToStraightSections: true },
    );
};

const createStraightLineDiagram = (lineName: DiagrammableLineName, options: CreateDiagramOptions = {}) => {
    const { pxPerStation = DEFAULT_PX_PER_STATION } = options;
    const start: Turtle = { x: 0, y: 0, theta: 90 };
    const stations = getStationsForLine(lineName);
    const path = execute({
        start,
        ranges: ['main'],
        commands: [line(pxPerStation * stations.length)],
    });
    return new Diagram([path], { main: stations });
};

export const createDefaultDiagramForLine = (lineName: DiagrammableLineName, options: CreateDiagramOptions = {}) => {
    switch (lineName) {
        case 'Red':
            return createRedLineDiagram(options);
        case 'Green':
            return createGreenLineDiagram(options);
        default:
            return createStraightLineDiagram(lineName, options);
    }
};
