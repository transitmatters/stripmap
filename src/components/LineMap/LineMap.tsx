import React, { useMemo, useState } from 'react';

import type { Diagram, SegmentLocation, Station, Point } from '../../diagrams';
import { useDiagramCoordinates, useLineTooltip } from '../../hooks';

import * as styles from './LineMap.css';
import { getSegmentLabelBounds, getStationLabelBounds } from './labels';
import type { SegmentLabel, StationLabel } from './labels';
import { getWatermarkStyle } from './watermark';
import type { WatermarkOptions } from './watermark';

export type { SegmentLabel, StationLabel } from './labels';
export type { WatermarkOptions, WatermarkPosition } from './watermark';

type StrokeOptions = {
    stroke: string;
    strokeWidth: number;
    opacity: number;
};

type OffsetStrokeOptions = StrokeOptions & { offset?: number };

export type SegmentRenderOptions = {
    location: SegmentLocation;
    strokes?: Partial<OffsetStrokeOptions>[];
    labels?: SegmentLabel[];
};

export type StationDotOptions = Partial<StrokeOptions> & { radius?: number; fill?: string };

export type StationRenderOptions = {
    stationId: string;
    dot?: StationDotOptions;
    labels?: StationLabel[];
};

export type TooltipSide = 'left' | 'right' | 'top';

type TooltipRenderer = (props: { segmentLocation: SegmentLocation<true>; side: TooltipSide }) => React.ReactNode;

type TooltipOptions = {
    render: TooltipRenderer;
    snapToSegment?: boolean;
    maxDistance?: number;
};

type StationTooltipRenderer = (props: { stationId: string; stationName: string; side: TooltipSide }) => React.ReactNode;

export type StationTooltipOptions = {
    render: StationTooltipRenderer;
};

export interface LineMapProps {
    diagram: Diagram;
    direction?: 'vertical' | 'horizontal';
    strokeOptions?: Partial<StrokeOptions>;
    tooltip?: TooltipOptions;
    getStationLabel?: (options: { stationId: string; stationName: string }) => string;
    getScaleBasis?: (viewport: { width: null | number; height: null | number }) => number;
    getSegments?: (options: { isHorizontal: boolean }) => SegmentRenderOptions[];
    /** Per-station dot styles and labels, e.g. to show ridership at each stop */
    getStations?: (options: { isHorizontal: boolean }) => StationRenderOptions[];
    /** Shown while a station is hovered or focused, in place of the segment tooltip */
    stationTooltip?: StationTooltipOptions;
    onStationClick?: (stationId: string) => void;
    watermark?: WatermarkOptions;
}

const DEFAULT_STATION_DOT_RADIUS = 1.5;
// Less than half the default spacing between stations, so neighboring targets don't overlap
const STATION_HIT_TARGET_RADIUS = 4;

const getPropsForStrokeOptions = (options: Partial<StrokeOptions>) => {
    return {
        fill: 'transparent',
        stroke: 'black',
        strokeWidth: 1,
        opacity: 1,
        ...options,
    };
};

export const LineMap = (props: LineMapProps) => {
    const {
        diagram,
        direction = 'horizontal' as const,
        getStationLabel,
        getScaleBasis,
        strokeOptions = {},
        tooltip,
        getSegments,
        getStations,
        stationTooltip,
        onStationClick,
        watermark,
    } = props;
    const [hoveredStationId, setHoveredStationId] = useState<null | string>(null);
    const {
        svgRef,
        svgProps,
        containerRef,
        isHorizontal,
        viewportCoordsToContainer,
        viewportCoordsToDiagram,
        diagramCoordsToViewport,
    } = useDiagramCoordinates({
        getScaleBasis,
        direction,
    });

    const { viewportCoordinates: tooltipViewportCoordinates, segmentLocation: tooltipSegmentLocation } = useLineTooltip(
        {
            diagram,
            diagramCoordsToViewport,
            viewportCoordsToDiagram,
            snapToSegment: !!tooltip?.snapToSegment,
            enabled: !!tooltip,
            maxDistance: tooltip?.maxDistance,
        },
    );

    const pathDirective = useMemo(() => diagram.toSVG(), [diagram]);

    const stationsById = useMemo(() => {
        const index: Record<string, Station> = {};
        diagram.getStations().forEach((station) => {
            index[station.station] = station;
        });
        return index;
    }, [diagram]);

    const stationPositions: Record<string, Point> = useMemo(() => {
        const positions: Record<string, Point> = {};
        for (const station of diagram.getStations()) {
            positions[station.station] = diagram.getStationPosition(station.station);
        }
        return positions;
    }, [diagram]);

    const computedSegmentExtras = useMemo(() => {
        const segments = getSegments ? getSegments({ isHorizontal }) : [];
        return segments.map((segment) => {
            const {
                location: { fromStationId, toStationId },
                strokes = [],
                labels = [],
            } = segment;

            const path = diagram.getPathBetweenStations(fromStationId, toStationId);
            const bounds = diagram.getLabelPathBetweenStations(fromStationId, toStationId).getBounds();

            const computedStrokes = strokes.map((stroke) => {
                const pathDirective = path.offset(stroke.offset ?? 0).toSVG();
                return { pathDirective, stroke };
            });

            const computedLabels = labels.map((label, index) => {
                const { x, y, width, height } = getSegmentLabelBounds(bounds, label, isHorizontal);
                return (
                    <g key={`label-${fromStationId}-${toStationId}-${index}`} transform={`translate(${x}, ${y})`}>
                        <rect x={0} y={0} width={width} height={height} fill='transparent' />
                        {label.content({ width, height })}
                    </g>
                );
            });

            return { computedStrokes, computedLabels };
        });
    }, [getSegments, diagram, isHorizontal]);

    const computedStationExtras = useMemo(() => {
        const stations = getStations ? getStations({ isHorizontal }) : [];
        const dotsByStationId: Record<string, StationDotOptions> = {};
        const computedLabels: React.ReactNode[] = [];
        for (const { stationId, dot, labels = [] } of stations) {
            const position = stationPositions[stationId];
            // Skip stations that aren't on this diagram, so callers can pass data for a whole line
            if (!position) continue;
            if (dot) dotsByStationId[stationId] = dot;
            labels.forEach((label, index) => {
                const { x, y, width, height } = getStationLabelBounds(position, label, isHorizontal);
                computedLabels.push(
                    <g key={`station-extra-label-${stationId}-${index}`} transform={`translate(${x}, ${y})`}>
                        <rect x={0} y={0} width={width} height={height} fill='transparent' />
                        {label.content({ width, height })}
                    </g>,
                );
            });
        }
        return { dotsByStationId, computedLabels };
    }, [getStations, stationPositions, isHorizontal]);

    const getTooltipSide = (viewportX: undefined | number): TooltipSide => {
        const tooltipOnRightSide = viewportX && viewportX / window.innerWidth <= 0.5;
        return isHorizontal ? 'top' : tooltipOnRightSide ? 'right' : 'left';
    };

    const renderStationDots = () => {
        return Object.entries(stationPositions).map(([stationId, pos]) => {
            const {
                radius = DEFAULT_STATION_DOT_RADIUS,
                fill = 'white',
                ...dotStrokeOptions
            } = computedStationExtras.dotsByStationId[stationId] ?? {};
            const strokeProps = getPropsForStrokeOptions({ ...strokeOptions, ...dotStrokeOptions });
            return (
                <circle
                    cx={0}
                    cy={0}
                    r={radius}
                    key={`${stationId}-dot`}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    {...strokeProps}
                    fill={fill}
                />
            );
        });
    };

    const renderStationLabels = () => {
        return Object.entries(stationPositions).map(([stationId, pos]) => {
            const stationName = stationsById[stationId].stop_name;
            const stationLabel = getStationLabel?.({ stationId, stationName }) ?? stationName;
            if (stationLabel) {
                return (
                    <text
                        key={`station-label-${stationId}`}
                        fontSize={4}
                        fill='currentColor'
                        textAnchor='end'
                        x={-4}
                        y={1.5}
                        aria-hidden='true'
                        transform={`translate(${pos.x} ${pos.y}) rotate(${isHorizontal ? 45 : 0})`}
                    >
                        {stationLabel}
                    </text>
                );
            }
            return null;
        });
    };

    const renderStationHitTargets = () => {
        if (!stationTooltip && !onStationClick) {
            return null;
        }
        const clearHoveredStation = (stationId: string) =>
            setHoveredStationId((current) => (current === stationId ? null : current));
        return Object.entries(stationPositions).map(([stationId, pos]) => {
            const stationName = stationsById[stationId].stop_name;
            const clickProps = onStationClick && {
                role: 'button',
                tabIndex: 0,
                onClick: () => onStationClick(stationId),
                onKeyDown: (evt: React.KeyboardEvent) => {
                    if (evt.key === 'Enter' || evt.key === ' ') {
                        evt.preventDefault();
                        onStationClick(stationId);
                    }
                },
            };
            return (
                <circle
                    key={`station-hit-target-${stationId}`}
                    className={onStationClick ? styles.clickableStationHitTarget : styles.stationHitTarget}
                    cx={0}
                    cy={0}
                    r={STATION_HIT_TARGET_RADIUS}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    aria-label={stationName}
                    onMouseEnter={() => setHoveredStationId(stationId)}
                    onMouseLeave={() => clearHoveredStation(stationId)}
                    onFocus={() => setHoveredStationId(stationId)}
                    onBlur={() => clearHoveredStation(stationId)}
                    {...clickProps}
                />
            );
        });
    };

    const renderLine = () => {
        return <path d={pathDirective} {...getPropsForStrokeOptions(strokeOptions)} />;
    };

    const renderComputedStrokes = () => {
        return computedSegmentExtras
            .map((segment, segmentIndex) => {
                return segment.computedStrokes.map(({ pathDirective, stroke }, strokeIndex) => {
                    return (
                        <path
                            key={`computed-stroke-${segmentIndex}-${strokeIndex}`}
                            d={pathDirective}
                            {...getPropsForStrokeOptions(stroke)}
                        />
                    );
                });
            })
            .flat();
    };

    const renderComputedLabels = () => {
        const transform = isHorizontal ? 'rotate(90)' : undefined;
        return (
            <g transform={transform}>
                {computedSegmentExtras.map((segment) => segment.computedLabels).flat()}
                {computedStationExtras.computedLabels}
            </g>
        );
    };

    const renderTooltipContainer = (
        viewportCoordinates: Point,
        side: TooltipSide,
        contents: React.ReactNode,
        className = styles.tooltipContainer,
    ) => {
        const { x, y } = viewportCoordsToContainer(viewportCoordinates);
        return (
            <div
                className={className}
                style={{
                    left: x,
                    top: y,
                    transform:
                        side === 'top'
                            ? `translate(-50%, -100%)`
                            : side === 'left'
                              ? `translate(-100%, -50%)`
                              : `translateY(-50%)`,
                }}
            >
                {contents}
            </div>
        );
    };

    const renderStationTooltip = () => {
        const station = hoveredStationId && stationsById[hoveredStationId];
        if (stationTooltip && station) {
            const viewportCoordinates = diagramCoordsToViewport(stationPositions[station.station]);
            const side = getTooltipSide(viewportCoordinates.x);
            const contents = stationTooltip.render({
                stationId: station.station,
                stationName: station.stop_name,
                side,
            });
            if (contents) {
                return renderTooltipContainer(viewportCoordinates, side, contents, styles.stationTooltipContainer);
            }
        }
        return null;
    };

    const renderTooltip = () => {
        const tooltipSide = getTooltipSide(tooltipViewportCoordinates?.x);
        const tooltipContents =
            tooltipSegmentLocation && tooltip?.render({ segmentLocation: tooltipSegmentLocation, side: tooltipSide });
        if (tooltipViewportCoordinates && tooltipContents) {
            return renderTooltipContainer(tooltipViewportCoordinates, tooltipSide, tooltipContents);
        }
    };

    const renderWatermark = () => {
        if (watermark) {
            return (
                <div className={styles.watermarkContainer} style={getWatermarkStyle(watermark)}>
                    {watermark.content}
                </div>
            );
        }
        return null;
    };

    return (
        <div className={styles.container} ref={containerRef}>
            <div className={styles.inner}>
                <svg ref={svgRef} {...svgProps}>
                    <g transform={`rotate(${isHorizontal ? -90 : 0})`}>
                        {renderLine()}
                        {renderComputedStrokes()}
                        {renderComputedLabels()}
                        {renderStationDots()}
                        {renderStationLabels()}
                        {renderStationHitTargets()}
                    </g>
                </svg>
            </div>
            {renderWatermark()}
            {renderStationTooltip() ?? renderTooltip()}
        </div>
    );
};
