import { style } from '@vanilla-extract/css';

export const container = style({
    display: 'flex',
    justifyContent: 'center',
    fontFamily: 'sans-serif',
    position: 'relative',
});

export const tooltipContainer = style({
    position: 'absolute',
    '@media': {
        'screen and (min-width: 770px)': {
            zIndex: 1,
        },
    },
});

// The tooltip opens over the station it describes, so it mustn't steal the hover from it
export const stationTooltipContainer = style([tooltipContainer, { pointerEvents: 'none' }]);

export const watermarkContainer = style({
    position: 'absolute',
    pointerEvents: 'none',
    userSelect: 'none',
});

export const stationHitTarget = style({
    fill: 'transparent',
    stroke: 'none',
    outline: 'none',
});

export const clickableStationHitTarget = style([
    stationHitTarget,
    {
        cursor: 'pointer',
        selectors: {
            '&:focus-visible': {
                stroke: 'currentColor',
                strokeWidth: 0.75,
            },
        },
    },
]);

export const inner = style({
    overflowX: 'scroll',
});
