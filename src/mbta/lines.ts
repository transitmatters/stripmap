import { line, wiggle } from '../diagrams/commands';
import { Diagram } from '../diagrams/diagram';
import { execute } from '../diagrams/execute';
import type { StationDetails, Turtle } from '../diagrams/types';

import { stations } from './stations';

type DiagrammableLineName = 'Red' | 'Green' | 'Orange' | 'Blue';

type CreateDiagramOptions = {
    /** Number of pixels between each station */
    pxPerStation?: number;
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
    const stationsM = getStationsForLine('Red', 'M');
    console.log('stationsM', stationsM);
    const splitIndex = stationsA.findIndex((station) => station.station === 'place-jfk');
    const stationsTrunk = stationsA.slice(0, splitIndex + 1);
    const stationsABranch = stationsA.slice(splitIndex + 1);
    const stationsBBranch = stationsB.slice(splitIndex + 1);

    const mattapanTrunk = line(pxPerStation * (1 + 1), ['trunk']);

    const stationsMBranch = stationsM; //.slice(splitIndexMattapan + 1);
    console.log('stationsMBranch', stationsMBranch);

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
    const pathM = execute({
        start: { x: -20, y: 185, theta: 90 },
        ranges: ['branch-m'],
        commands: [
            mattapanTrunk,
            wiggle(15, 0),
            line(20),
            // Transfer...
            line(pxPerStation * stationsMBranch.length, ['branch-m-stations']),
        ],
    });

    return new Diagram([pathA, pathB, pathM], {
        trunk: stationsTrunk,
        'branch-a-stations': stationsABranch,
        'branch-b-stations': stationsBBranch,
        'branch-m-stations': stationsMBranch,
    });
};

// find index of station in list of stations given its MBTA ID (e.g. copley = place-coecl)
function getStationIndex(stations: StationDetails[], stationName: string): number {
    return stations.findIndex((s) => s.station === stationName);
}

export const createGreenLineDiagram = (options: CreateDiagramOptions = {}) => {
    const { pxPerStation = DEFAULT_PX_PER_STATION } = options;
    const startB: Turtle = { x: 40, y: -130, theta: 90 };
    const startC: Turtle = { x: 0, y: -80, theta: 90 };
    const startD: Turtle = { x: -40, y: -80, theta: 90 };
    const startE: Turtle = { x: -80, y: -40, theta: 90 };
    const stationsE = getStationsForLine('Green', 'E').reverse();

    // you could calculate this more easily if you just figured out all the places where
    // every branch is served... no need to over engineer though
    const stationsTrunkForE = stationsE.slice(
        getStationIndex(stationsE, 'place-coecl'),
        getStationIndex(stationsE, 'place-lech') + 1,
    );
    const stationsEBeforeTrunk = stationsE.slice(0, getStationIndex(stationsE, 'place-coecl'));
    const stationsEAfterTrunk = stationsE.slice(getStationIndex(stationsE, 'place-lech') + 1);

    const stationsD = getStationsForLine('Green', 'D').reverse();

    const kenmoreIdxD = getStationIndex(stationsD, 'place-kencl');
    const stationsTrunkForBCD = stationsD.slice(kenmoreIdxD, getStationIndex(stationsD, 'place-lech') + 1);
    const trunkCommandBCD = line(stationsTrunkForBCD.length * pxPerStation, ['trunk']);
    const stationsDBeforeTrunk = stationsD.slice(0, getStationIndex(stationsD, 'place-coecl'));
    const stationsDAfterTrunk = stationsD.slice(getStationIndex(stationsD, 'place-lech') + 1);

    const stationsC = getStationsForLine('Green', 'C').reverse();
    const stationsCBeforeTrunk = stationsC.slice(0, getStationIndex(stationsC, 'place-kencl'));

    const stationsB = getStationsForLine('Green', 'B').reverse();
    const stationsBBeforeTrunk = stationsB.slice(0, getStationIndex(stationsB, 'place-kencl'));

    const pathB = execute({
        start: startB,
        ranges: ['branch-b-stations'],
        commands: [
            line(pxPerStation * stationsBBeforeTrunk.length, ['branch-b-stations']),
            line(70),
            wiggle(15, -40),
            trunkCommandBCD,
        ],
    });

    const pathC = execute({
        start: startC,
        ranges: ['branch-c-stations'],
        commands: [line(pxPerStation * stationsCBeforeTrunk.length, ['branch-c-stations']), line(30), trunkCommandBCD],
    });

    const pathD = execute({
        start: startD,
        ranges: ['branch-d-stations'],
        commands: [
            line(pxPerStation * stationsDBeforeTrunk.length, ['branch-d-stations']),
            line(30),
            wiggle(15, 40),
            trunkCommandBCD,
            wiggle(15, 40),
            line(pxPerStation * stationsDAfterTrunk.length, ['branch-d-stations']),
        ],
    });

    const pathE = execute({
        start: startE,
        ranges: ['branch-e-stations'],
        commands: [
            line(pxPerStation * stationsEBeforeTrunk.length, ['branch-e-stations']),
            line(40),
            wiggle(30, 80),
            line(pxPerStation * stationsTrunkForE.length, ['trunk']),
            line(40),
            line(pxPerStation * stationsEAfterTrunk.length, ['branch-e-stations']),
        ],
    });

    return new Diagram([pathB, pathC, pathD, pathE], {
        trunk: stationsTrunkForBCD,
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
