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

export const inner = style({
    overflowX: 'scroll',
});
