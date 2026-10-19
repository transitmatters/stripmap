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
