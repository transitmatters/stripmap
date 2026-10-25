# stripmap

```
npm install @transitmatters/stripmap
```

This library can be used to create strip maps using React and SVG, like this one from the [TransitMatters Data Dashboard](https://dashboard.transitmatters.org/red/slowzones):

<img width="1146" alt="image" src="https://github.com/transitmatters/stripmap/assets/2208769/5d1724a5-4349-4bea-8f46-6a038bb31b65">

## Straight lines

For lines whose shape isn't built in (bus routes, commuter rail lines, etc.), `StraightLineMap` renders a straight line with evenly spaced stops in a given color:

```tsx
import { StraightLineMap } from '@transitmatters/stripmap';

<StraightLineMap
    color='#ffc72c'
    stations={[
        { station: 'hhgat', stop_name: 'Harvard' },
        { station: 'cntsq', stop_name: 'Central Square (Cambridge)' },
        { station: 'nubn', stop_name: 'Nubian Station' },
    ]}
/>;
```

It accepts the same props as `LineMap` (`direction`, `tooltip`, `getSegments`, etc.) apart from `diagram`. If you need the `Diagram` itself, call `createStraightLineDiagram(stations, { pxPerStation })` and pass it to `LineMap`.

## Stations

`LineMap` can also show information at each station, such as ridership or accessibility:

```tsx
<LineMap
    diagram={diagram}
    // Style each station's dot and draw content beside it, like segment labels
    getStations={({ isHorizontal }) => [
        {
            stationId: 'place-pktrm',
            dot: { radius: 3, fill: 'green' },
            labels: [{ mapSide: '0', content: ({ width, height }) => <text>3.8k</text> }],
        },
    ]}
    // Shown while a station is hovered or focused, in place of the segment tooltip
    stationTooltip={{ render: ({ stationId, stationName, side }) => <div>{stationName}</div> }}
    // Makes stations focusable buttons
    onStationClick={(stationId) => setSelectedStationId(stationId)}
/>
```

Station labels take the same `mapSide`, `boundingSize` and `offset` options as segment labels, plus `length`, which sets how far the label extends along the line (default 10).

## Development

```
npm install
npm run check      # ESLint + tsc
npm test           # Jest
npm run build      # Library build into dist/
npm run storybook  # Component stories on port 6006
```

Components live in `src/components/`, diagram geometry in `src/diagrams/`, and MBTA line and station data in `src/mbta/`.

## Releasing

Bump the `version` in `package.json` (e.g. `npm version patch --no-git-tag-version`) and merge to `main`. The [publish workflow](.github/workflows/publish.yml) will build, test, and publish the new version to [npm](https://www.npmjs.com/package/@transitmatters/stripmap) and GitHub Packages, then create a `vX.Y.Z` GitHub release. Pushes that don't change the version publish nothing.

Publishing to npm uses [trusted publishing](https://docs.npmjs.com/trusted-publishers), so no npm token is needed. It is configured on npmjs.com under the package's Settings → Trusted Publisher (GitHub Actions, org `transitmatters`, repo `stripmap`, workflow `publish.yml`).
