import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import type { Station } from '../../diagrams';
import { StraightLineMap } from './StraightLineMap';

const fitchburgLine: Station[] = [
    { station: 'place-FR-3338', stop_name: 'Wachusett' },
    { station: 'place-FR-0494', stop_name: 'Fitchburg' },
    { station: 'place-FR-0451', stop_name: 'North Leominster' },
    { station: 'place-FR-0394', stop_name: 'Shirley' },
    { station: 'place-FR-0361', stop_name: 'Ayer' },
    { station: 'place-FR-0301', stop_name: 'Littleton/Route 495' },
    { station: 'place-FR-0253', stop_name: 'South Acton' },
    { station: 'place-FR-0219', stop_name: 'West Concord' },
    { station: 'place-FR-0201', stop_name: 'Concord' },
    { station: 'place-FR-0167', stop_name: 'Lincoln' },
    { station: 'place-FR-0147', stop_name: 'Silver Hill' },
    { station: 'place-FR-0132', stop_name: 'Kendal Green' },
    { station: 'place-FR-0115', stop_name: 'Brandeis/Roberts' },
    { station: 'place-FR-0098', stop_name: 'Waltham' },
    { station: 'place-FR-0074', stop_name: 'Waverley' },
    { station: 'place-FR-0064', stop_name: 'Belmont' },
    { station: 'place-portr', stop_name: 'Porter' },
    { station: 'place-north', stop_name: 'North Station' },
];

const route1Bus: Station[] = [
    { station: 'hhgat', stop_name: 'Harvard' },
    { station: 'maput', stop_name: 'Mass Ave & Putnam Ave' },
    { station: 'cntsq', stop_name: 'Central Square (Cambridge)' },
    { station: 'mit', stop_name: 'MIT @ Mass Ave' },
    { station: 'hynes', stop_name: 'Hynes Station' },
    { station: 'masta', stop_name: 'Mass Ave (Orange Line)' },
    { station: 'wasma', stop_name: 'Mass Ave @ Washington' },
    { station: 'melwa', stop_name: 'Melnea Cass @ Washington' },
    { station: 'nubn', stop_name: 'Nubian Station' },
];

const meta: Meta<typeof StraightLineMap> = {
    title: 'StraightLineMap',
    component: StraightLineMap,
    argTypes: {
        direction: { options: ['horizontal', 'vertical'], control: { type: 'radio' } },
        color: { control: { type: 'color' } },
        stations: { control: { disable: true } },
        getSegments: { control: { disable: true } },
    },
};

export const CommuterRail: StoryObj<typeof StraightLineMap> = {
    args: { stations: fitchburgLine, color: '#80276c', direction: 'horizontal' },
};

export const Bus: StoryObj<typeof StraightLineMap> = {
    args: { stations: route1Bus, color: '#ffc72c', direction: 'horizontal', pxPerStation: 15 },
};

export const BusWithSegments = () => (
    <StraightLineMap
        stations={route1Bus}
        color='#ffc72c'
        pxPerStation={15}
        getSegments={() => [
            {
                location: { fromStationId: 'cntsq', toStationId: 'hynes' },
                strokes: [{ offset: 1, stroke: '#ffc72c', opacity: 0.6 }],
            },
        ]}
    />
);

export default meta;
