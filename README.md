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
