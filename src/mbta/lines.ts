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
    const startB: Turtle = { x: 40, y: 0, theta: 90 };
    const startC: Turtle = { x: 0, y: -40, theta: 90 };
    const startD: Turtle = { x: -40, y: -80, theta: 90 };
    const startE: Turtle = { x: -80, y: -20, theta: 90 };
    const stationsE = getStationsForLine('Green', 'E').reverse();

    // you could calculate this more easily if you just figured out all the places where
    // every branch is served... no need to over engineer though
    const stationsTrunkForE = stationsE.slice(
        getStationIndex(stationsE, 'place-coecl'),
        getStationIndex(stationsE, 'place-lech') + 1,
    );
    const stationsEBeforeTrunk = stationsE.slice(0, getStationIndex(stationsE, 'place-coecl'));
    console.log(stationsEBeforeTrunk);
    const stationsEAfterTrunk = stationsE.slice(getStationIndex(stationsE, 'place-lech') + 1);
    console.log(stationsEAfterTrunk);

    const stationsD = getStationsForLine('Green', 'D').reverse();

    const kenmoreIdxD = getStationIndex(stationsD, 'place-kencl');
    const stationsTrunkForBCD = stationsD.slice(kenmoreIdxD, getStationIndex(stationsD, 'place-lech') + 1);
    const trunkCommandBCD = line(stationsTrunkForBCD.length);
    const stationsDBeforeTrunk = stationsD.slice(0, getStationIndex(stationsD, 'place-coecl'));
    const stationsDAfterTrunk = stationsD.slice(getStationIndex(stationsD, 'place-lech') + 1);

    const stationsC = getStationsForLine('Green', 'C').reverse();
    const stationsCBeforeTrunk = stationsC.slice(0, getStationIndex(stationsC, 'place-kencl'));

    const stationsB = getStationsForLine('Green', 'B').reverse();
    const stationsBBeforeTrunk = stationsB.slice(0, getStationIndex(stationsB, 'place-kencl'));

    const pathB = execute({
        start: startB,
        ranges: ['branch-b-stations'],
        commands: [line(pxPerStation * stationsBBeforeTrunk.length), wiggle(15, -40), trunkCommandBCD],
    });

    const pathC = execute({
        start: startC,
        ranges: ['branch-c-stations'],
        commands: [line(pxPerStation * stationsCBeforeTrunk.length), line(40), trunkCommandBCD],
    });

    const pathD = execute({
        start: startD,
        ranges: ['branch-d-stations'],
        commands: [
            line(pxPerStation * stationsDBeforeTrunk.length),
            wiggle(15, 40),
            trunkCommandBCD,
            wiggle(15, 40),
            line(pxPerStation * stationsDAfterTrunk.length),
        ],
    });

    const pathE = execute({
        start: startE,
        ranges: ['branch-e-stations'],
        commands: [
            line(pxPerStation * stationsEBeforeTrunk.length),
            line(20),
            wiggle(30, 80),
            line(pxPerStation * stationsTrunkForE.length),
            line(pxPerStation * stationsEAfterTrunk.length),
        ],
    });

    return new Diagram([pathB, pathC, pathD, pathE], {
        'branch-b-stations': stationsB,
        'branch-c-stations': stationsC,
        'branch-d-stations': stationsD,
        'branch-e-stations': stationsE,
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
