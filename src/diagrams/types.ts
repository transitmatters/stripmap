import type { Bezier, Projection } from 'bezier-js';

import type { Path } from './path';

export type Turtle = {
    x: number;
    y: number;
    theta: number;
};

export type BaseCommand = {
    ranges: RangeNames;
};

export type LineCommand = BaseCommand & {
    type: 'line';
    length: number;
};

export type CurveCommand = BaseCommand & {
    type: 'curve';
    length: number;
    angle: number;
};

export type WiggleCommand = BaseCommand & {
    type: 'wiggle';
    length: number;
    width: number;
};

export type Command = LineCommand | CurveCommand | WiggleCommand;

export type CommandPath = {
    start: Turtle;
    commands: Command[];
    ranges?: RangeNames;
};

export type CommandResult = {
    turtle: Turtle;
    curve: Bezier;
};

export type SegmentLocation<Nullable extends boolean = false> = {
    fromStationId: (Nullable extends true ? null : never) | string;
    toStationId: (Nullable extends true ? null : never) | string;
};

export type RangeNames = string[];

export type RangeLookup = { range: string; fraction: number };

export type PathProjection = {
    segmentProjection: Projection;
    distance: number;
    displacement: number;
};

export type DiagramProjection = {
    segmentProjection: Projection;
    path: Path;
    segmentLocation: SegmentLocation<true>;
};

export type Station = {
    station: string;
    stop_name: string;
    transfers?: string[];
};

export type StationDetails = {
    stop_name: string;
    branches: Array<string> | null;
    station: string;
    order: number;
    stops: Record<string, Array<string>>;
    accessible: boolean;
    enclosed_bike_parking?: boolean;
    pedal_park?: boolean;
    terminus?: boolean;
    short?: string;
    disabled?: boolean;
};

export type Transfer = {
    FromStation: Station;
    ToStation: Station;
};

export type Point = {
    x: number;
    y: number;
};
