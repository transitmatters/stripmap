import { createGreenLineDiagram } from '../../mbta/lines';

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
});
