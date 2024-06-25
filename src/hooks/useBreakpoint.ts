import { useMediaQuery } from 'react-responsive';

export function useBreakpoint(minWidth: number) {
    return useMediaQuery({
        query: `(min-width: ${minWidth})`,
    });
}
