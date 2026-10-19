import { createStraightLineDiagram } from './straightLine';

const stations = [
    { station: 'a', stop_name: 'Alpha' },
    { station: 'b', stop_name: 'Bravo' },
    { station: 'c', stop_name: 'Charlie' },
    { station: 'd', stop_name: 'Delta' },
];

describe('createStraightLineDiagram', () => {
    test('includes every station', () => {
        const diagram = createStraightLineDiagram(stations);
        expect(diagram.getStations().map((s) => s.station)).toEqual(['a', 'b', 'c', 'd']);
    });

    test('spaces stations evenly and in order along the line', () => {
        const diagram = createStraightLineDiagram(stations, { pxPerStation: 20 });
        const positions = stations.map(({ station }) => diagram.getStationPosition(station));
        positions.forEach((pos) => expect(pos.x).toBeCloseTo(0));
        const gaps = positions.slice(1).map((pos, i) => pos.y - positions[i].y);
        gaps.forEach((gap) => expect(gap).toBeCloseTo(gaps[0]));
        expect(positions[0].y).toBeCloseTo(0);
        expect(positions[positions.length - 1].y).toBeCloseTo(20 * stations.length);
    });

    test('produces adjacent segments between consecutive stations', () => {
        const diagram = createStraightLineDiagram(stations);
        expect(diagram.getAdjacentSegmentLocations()).toEqual([
            { fromStationId: 'a', toStationId: 'b' },
            { fromStationId: 'b', toStationId: 'c' },
            { fromStationId: 'c', toStationId: 'd' },
        ]);
    });

    test('can get paths between any pair of stations', () => {
        const diagram = createStraightLineDiagram(stations);
        expect(diagram.getPathBetweenStations('a', 'd').length).toBeGreaterThan(0);
        expect(diagram.getPathBetweenStations('c', 'b').length).toBeGreaterThan(0);
    });

    test('supports a single station', () => {
        const diagram = createStraightLineDiagram([stations[0]]);
        expect(diagram.getStations()).toHaveLength(1);
        expect(() => diagram.getStationPosition('a')).not.toThrow();
    });

    test('rejects an empty list of stations', () => {
        expect(() => createStraightLineDiagram([])).toThrow();
    });

    test('rejects duplicate station ids', () => {
        expect(() => createStraightLineDiagram([...stations, stations[0]])).toThrow(/a appears more than once/);
    });
});
