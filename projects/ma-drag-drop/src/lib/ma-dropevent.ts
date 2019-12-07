import { DropEffect } from './ma-types';

export interface MaDropEvent {
    event: DragEvent;
    dropEffect: DropEffect;
    isExternal: boolean;
    data?: any;
    index?: number;
    type?: any;
}