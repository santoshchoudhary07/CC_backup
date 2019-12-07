import { DropEffect, EffectAllowed } from "./ma-types";

export interface DragDropData {
    data?: any;
    type?: string;
}

export interface MaEvent extends DragEvent {
    _maUsingHandle?: boolean;
    _maDropzoneActive?: true;
}

export type MaDragImageOffsetFunction = (event: DragEvent, dragImage: Element) => { x: number, y: number };
export const DROP_EFFECTS = ["move", "copy", "link"] as DropEffect[];
export const CUSTOM_MIME_TYPE = "application/x-ma";
export const JSON_MIME_TYPE = "application/json";
export const MSIE_MIME_TYPE = "Text";

function mimeTypeIsCustom(mimeType: string) {
    return mimeType.substr(0, CUSTOM_MIME_TYPE.length) === CUSTOM_MIME_TYPE;
}

export function getWellKnownMimeType(event: DragEvent): string | null {
    if (event.dataTransfer) {
        const types = event.dataTransfer.types;
        if (!types) {
            return MSIE_MIME_TYPE;
        }
        for (let i = 0; i < types.length; i++) {
            if (types[i] === MSIE_MIME_TYPE || types[i] === JSON_MIME_TYPE || mimeTypeIsCustom(types[i])) {
                return types[i];
            }
        }
    }
    return null;
}

export function setDragData(event: DragEvent, data: DragDropData, effectAllowed: EffectAllowed): void {
    const mimeType = CUSTOM_MIME_TYPE + (data.type ? ("-" + data.type) : "");
    const dataString = JSON.stringify(data);
    try {
        event.dataTransfer.setData(mimeType, dataString);
    }
    catch (e) {
        try {
            event.dataTransfer.setData(JSON_MIME_TYPE, dataString);
        }
        catch (e) {
            const effectsAllowed = filterEffects(DROP_EFFECTS, effectAllowed);
            event.dataTransfer.effectAllowed = effectsAllowed[0];
            event.dataTransfer.setData(MSIE_MIME_TYPE, dataString);
        }
    }
}

export function getDropData(event: DragEvent, dragIsExternal: boolean): DragDropData {
    const mimeType = getWellKnownMimeType(event);
    if (dragIsExternal === true) {     // drag did not originate from [maDraggable]
        if (mimeType !== null && mimeTypeIsCustom(mimeType)) {
            return JSON.parse(event.dataTransfer.getData(mimeType));  // the type of content is well known and safe to handle
        }
        return {};       // the contained data is unknown, let user handle it
    }
    return JSON.parse(event.dataTransfer.getData(mimeType));  // the type of content is well known and safe to handle
}

export function filterEffects(effects: DropEffect[], allowed: EffectAllowed | DropEffect): DropEffect[] {
    if (allowed === "all"
        || allowed === "uninitialized") {
        return effects;
    }
    return effects.filter(function (effect) {
        return allowed.toLowerCase().indexOf(effect) !== -1;
    });
}

export function getDirectChildElement(parentElement: Element, childElement: Element): Element | null {
    let directChild: Node = childElement;
    while (directChild.parentNode !== parentElement) {
        if (!directChild.parentNode) {
            return null;
        }
        directChild = directChild.parentNode;
    }
    return directChild as Element;
}

export function shouldPositionPlaceholderBeforeElement(event: DragEvent, element: Element, horizontal: boolean) {
    const bounds = element.getBoundingClientRect();
    // If the pointer is in the upper half of the list item element,
    // we position the placeholder before the list item, otherwise after it.
    if (horizontal) {
        return (event.clientX < bounds.left + bounds.width / 2);
    }
    return (event.clientY < bounds.top + bounds.height / 2);
}

export function calculateDragImageOffset(event: DragEvent, dragImage: Element): { x: number, y: number } {
    const dragImageComputedStyle = window.getComputedStyle(dragImage);
    const paddingTop = parseFloat(dragImageComputedStyle.paddingTop) || 0;
    const paddingLeft = parseFloat(dragImageComputedStyle.paddingLeft) || 0;
    const borderTop = parseFloat(dragImageComputedStyle.borderTopWidth) || 0;
    const borderLeft = parseFloat(dragImageComputedStyle.borderLeftWidth) || 0;
    return {
        x: event.offsetX + paddingLeft + borderLeft,
        y: event.offsetY + paddingTop + borderTop
    };
}

export function setDragImage(event: DragEvent, dragImage: Element, offsetFunction: MaDragImageOffsetFunction): void {
    const offset = offsetFunction(event, dragImage) || { x: 0, y: 0 };
    (event.dataTransfer as any).setDragImage(dragImage, offset.x, offset.y);
}