import { CUSTOM_MIME_TYPE, DROP_EFFECTS, filterEffects, getWellKnownMimeType, JSON_MIME_TYPE, MSIE_MIME_TYPE } from "./ma-utils";
import { DropEffect, EffectAllowed } from "./ma-types";

export interface MaState {
    isDragging: boolean;
    dropEffect?: DropEffect;
    effectAllowed?: EffectAllowed;
    type?: string;
}

const _maState: MaState = {
    isDragging: false,
    dropEffect: "none",
    effectAllowed: "all",
    type: undefined
};

export function startDrag(event: DragEvent, effectAllowed: EffectAllowed, type: string | undefined) {
    _maState.isDragging = true;
    _maState.dropEffect = "none";
    _maState.effectAllowed = effectAllowed;
    _maState.type = type;
    event.dataTransfer.effectAllowed = effectAllowed;
}

export function endDrag() {
    _maState.isDragging = false;
    _maState.dropEffect = undefined;
    _maState.effectAllowed = undefined;
    _maState.type = undefined;
}

export function setDropEffect(event: DragEvent, dropEffect: DropEffect) {
    if (_maState.isDragging === true) {
        _maState.dropEffect = dropEffect;
    }
    event.dataTransfer.dropEffect = dropEffect;
}

export function getDropEffect(event: DragEvent, effectAllowed?: EffectAllowed | DropEffect): DropEffect {
    const dataTransferEffectAllowed: EffectAllowed = (event.dataTransfer) ? event.dataTransfer.effectAllowed as EffectAllowed : "uninitialized";
    let effects = filterEffects(DROP_EFFECTS, dataTransferEffectAllowed);
    if (_maState.isDragging === true) {
        effects = filterEffects(effects, _maState.effectAllowed);
    }
    if (effectAllowed) {
        effects = filterEffects(effects, effectAllowed);
    }
    if (effects.length === 0) {
        return "none";
    }
    if (event.ctrlKey && effects.indexOf("copy") !== -1) {
        return "copy";
    }
    if (event.altKey && effects.indexOf("link") !== -1) {
        return "link";
    }
    return effects[0] as DropEffect;
}

export function getMaType(event: DragEvent): string | undefined {
    if (_maState.isDragging === true) {
        return _maState.type;
    }
    const mimeType = getWellKnownMimeType(event);
    if (mimeType === null) {
        return undefined;
    }
    if (mimeType === MSIE_MIME_TYPE || mimeType === JSON_MIME_TYPE) {
        return undefined;
    }
    return mimeType.substr(CUSTOM_MIME_TYPE.length + 1) || undefined;
}

export function isExternalDrag(): boolean {
    return _maState.isDragging === false;
}

export const maState: Readonly<MaState> = _maState as Readonly<MaState>;