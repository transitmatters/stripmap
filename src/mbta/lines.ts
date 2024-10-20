import { line, wiggle } from '../diagrams/commands';
import { Diagram } from '../diagrams/diagram';
import { execute } from '../diagrams/execute';
import type { Turtle } from '../diagrams/types';

import { stations } from './stations';

type DiagrammableLineName = 'Red' | 'Green' | 'Orange' | 'Blue';

type CreateDiagramOptions = {
    /** Number of pixels between each station */
    pxPerStation?: number;
};

const DEFAULT_PX_PER_STATION = 10;

const getStationsForLine = (line: DiagrammableLineName, branch?: string) => {
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

// find index of station in list of stations given its MBTA ID (e.g. copley = place-coecl)
function getStationIndex(stations, stationName: string): number {
    return stations.findIndex((s) => s.station === stationName);
}

export const createGreenLineDiagram = (options: CreateDiagramOptions = {}) => {
    const { pxPerStation = DEFAULT_PX_PER_STATION } = options;
    const start: Turtle = { x: 0, y: 0, theta: 90 };
    const stationsE = getStationsForLine('Green', 'E');

    const copleyIndex = getStationIndex(stationsE, 'place-coecl');
    const govtCenterIndex = getStationIndex(stationsE, 'place-gover');
    // you could calculate this more easily if you just figured out all the places where
    // every branch is served... no need to over engineer though
    const stationsTrunk = stationsE.slice(govtCenterIndex, copleyIndex + 1);
    const stationsEBeforeTrunk = stationsE.slice(copleyIndex + 1, stationsE.length);

    const haymarketIdx = getStationIndex(stationsE, 'place-haecl');

    const stationsEAfterTrunk = stationsE.slice(0, haymarketIdx + 1);

    const trunkCommand = line(pxPerStation * stationsTrunk.length, ['trunk']);

    const stationsD = getStationsForLine('Green', 'D');
    const stationsDBeforeTrunk = stationsE.slice(getStationIndex(stationsD, 'place-coecl') + 1, stationsD.length);
    const stationsDAfterTrunk = stationsD.slice(0, getStationIndex(stationsD, 'place-haecl') + 1);

    const stationsC = getStationsForLine('Green', 'C');
    const stationsCBeforeTrunk = stationsC.slice(getStationIndex(stationsC, 'place-coecl') + 1, stationsC.length);

    const pathC = execute({
        start,
        ranges: ['branch-c-stations'],
        commands: [trunkCommand, wiggle(15, -40), line(pxPerStation * stationsCBeforeTrunk.length)],
    });

    const pathD = execute({
        start,
        ranges: ['branch-d-stations'],
        commands: [
            line(pxPerStation * stationsDAfterTrunk.length),
            trunkCommand,
            wiggle(15, -20),
            line(pxPerStation * stationsDBeforeTrunk.length),
        ],
    });

    const pathE = execute({
        start,
        ranges: ['branch-e-stations'],
        commands: [
            line(pxPerStation * stationsEAfterTrunk.length),
            trunkCommand,
            line(pxPerStation * stationsEBeforeTrunk.length),
        ],
    });

    return new Diagram([pathE, pathD, pathC], {
        trunk: stationsTrunk,
        'branch-e-stations': stationsE,
        'branch-d-stations': stationsD,
        'branch-c-stations': stationsC,
    });
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
