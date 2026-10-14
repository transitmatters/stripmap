import { createDefaultDiagramForLine, createGreenLineDiagram } from '../../mbta/lines';

describe('Green Line Diagram', () => {
    describe('Blandford-Kenmore path fix', () => {
        test('can get path between Blandford and Kenmore', () => {
            const diagram = createGreenLineDiagram();
            expect(() => {
                const path = diagram.getPathBetweenStations('place-bland', 'place-kencl');
                expect(path.length).toBeGreaterThan(0);
            }).not.toThrow();
        });

        test('can get path between Kenmore and Blandford (reverse)', () => {
            const diagram = createGreenLineDiagram();
            expect(() => {
                const path = diagram.getPathBetweenStations('place-kencl', 'place-bland');
                expect(path.length).toBeGreaterThan(0);
            }).not.toThrow();
        });

        test('can get path between Blandford and Boylston (through trunk)', () => {
            const diagram = createGreenLineDiagram();
            expect(() => {
                const path = diagram.getPathBetweenStations('place-bland', 'place-boyls');
                expect(path.length).toBeGreaterThan(0);
            }).not.toThrow();
        });

        test('can get path between Boylston and Kenmore (within trunk)', () => {
            const diagram = createGreenLineDiagram();
            expect(() => {
                const path = diagram.getPathBetweenStations('place-boyls', 'place-kencl');
                expect(path.length).toBeGreaterThan(0);
            }).not.toThrow();
        });

        test('can get path between BU East and Kenmore (B branch to trunk)', () => {
            const diagram = createGreenLineDiagram();
            expect(() => {
                const path = diagram.getPathBetweenStations('place-buest', 'place-kencl');
                expect(path.length).toBeGreaterThan(0);
            }).not.toThrow();
        });

        test('can get path between BU Central and Kenmore (B branch to trunk)', () => {
            const diagram = createGreenLineDiagram();
            expect(() => {
                const path = diagram.getPathBetweenStations('place-bucen', 'place-kencl');
                expect(path.length).toBeGreaterThan(0);
            }).not.toThrow();
        });
    });

    describe('Path validation', () => {
        test('returns valid path objects with length property', () => {
            const diagram = createGreenLineDiagram();
            const path = diagram.getPathBetweenStations('place-bland', 'place-kencl');

            expect(path).toBeDefined();
            expect(typeof path.length).toBe('number');
            expect(path.length).toBeGreaterThan(0);
        });

        test('handles multiple station pairs without errors', () => {
            const diagram = createGreenLineDiagram();
            const testPairs = [
                ['place-bland', 'place-kencl'],
                ['place-kencl', 'place-bland'],
                ['place-bland', 'place-boyls'],
                ['place-boyls', 'place-kencl'],
                ['place-buest', 'place-kencl'],
            ];

            testPairs.forEach(([from, to]) => {
                expect(() => {
                    const path = diagram.getPathBetweenStations(from, to);
                    expect(path.length).toBeGreaterThan(0);
                }).not.toThrow();
            });
        });
    });

    describe.each(['horizontal', 'vertical'] as const)('Layout (%s)', (direction) => {
        const diagram = createGreenLineDiagram({ pxPerStation: 15, direction });
        const distance = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);

        test('every pair of adjacent stations has a drawable segment', () => {
            const segments = diagram.getAdjacentSegmentLocations();
            // 74 stations, with B, C, D and E each joining or leaving the trunk once
            expect(segments).toHaveLength(69);
            for (const { fromStationId, toStationId } of segments) {
                const path = diagram.getPathBetweenStations(fromStationId, toStationId);
                for (const offset of [-1, 0, 1]) {
                    expect(path.offset(offset).toSVG()).not.toContain('NaN');
                }
            }
        });

        test.each([
            ['place-bland', 'place-kencl'],
            ['place-smary', 'place-kencl'],
            ['place-fenwy', 'place-kencl'],
            ['place-prmnl', 'place-coecl'],
            ['place-lech', 'place-esomr'],
            ['place-lech', 'place-unsqu'],
        ])('the segment from %s to %s meets the trunk at the station', (fromStationId, toStationId) => {
            const path = diagram.getPathBetweenStations(fromStationId, toStationId);
            const ends = [path.getPointFromFraction(0), path.getPointFromFraction(1)];
            for (const stationId of [fromStationId, toStationId]) {
                const position = diagram.getStationPosition(stationId);
                expect(Math.min(...ends.map((end) => distance(end, position)))).toBeLessThan(1e-6);
            }
        });

        test('stations along a straight run are evenly spaced', () => {
            const trunk = ['place-coecl', 'place-armnl', 'place-boyls', 'place-pktrm', 'place-gover', 'place-haecl'];
            for (let i = 0; i < trunk.length - 1; i++) {
                const a = diagram.getStationPosition(trunk[i]);
                const b = diagram.getStationPosition(trunk[i + 1]);
                expect(distance(a, b)).toBeCloseTo(15);
            }
        });

        test('Riverside to Medford/Tufts is a straight line, with B and C on one side and E on the other', () => {
            const spineX = diagram.getStationPosition('place-river').x;
            for (const stationId of ['place-kencl', 'place-coecl', 'place-lech', 'place-mdftf']) {
                expect(diagram.getStationPosition(stationId).x).toBeCloseTo(spineX);
            }
            const b = diagram.getStationPosition('place-lake').x;
            const c = diagram.getStationPosition('place-clmnl').x;
            const e = diagram.getStationPosition('place-hsmnl').x;
            const union = diagram.getStationPosition('place-unsqu').x;
            expect(b).toBeGreaterThan(c);
            expect(c).toBeGreaterThan(spineX);
            expect(e).toBeLessThan(spineX);
            expect(union).toBeGreaterThan(spineX);
        });
    });
});

describe.each(['Red', 'Orange', 'Blue', 'Mattapan'] as const)('%s Line Diagram', (line) => {
    test('every pair of adjacent stations has a drawable segment', () => {
        const diagram = createDefaultDiagramForLine(line, { pxPerStation: 15 });
        for (const { fromStationId, toStationId } of diagram.getAdjacentSegmentLocations()) {
            const path = diagram.getPathBetweenStations(fromStationId, toStationId);
            expect(path.offset(1).toSVG()).not.toContain('NaN');
        }
    });
});
