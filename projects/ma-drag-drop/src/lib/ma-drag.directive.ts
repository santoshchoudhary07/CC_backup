import { AfterViewInit, Directive, ElementRef, EventEmitter, HostBinding, HostListener, Input, NgZone, OnDestroy, Output, Renderer2 } from "@angular/core";

import { calculateDragImageOffset, MaDragImageOffsetFunction, MaEvent, setDragData, setDragImage } from "./ma-utils";
import { maState, endDrag, startDrag } from "./ma-state";
import { EffectAllowed } from "./ma-types";
import { MaHandleDirective } from './ma-drag-handle.directive';

@Directive({
    selector: "[maDragImageRef]"
})
export class MaDragImageRefDirective {

    constructor(parent: MaDragDirective, elementRef: ElementRef) {
        parent.registerDragImage(elementRef);
    }
}

@Directive({
    selector: "[maDraggable]"
})
export class MaDragDirective implements AfterViewInit, OnDestroy {
    @Input() maDraggable: any;
    @Input() maEffectAllowed: EffectAllowed = "copy";
    @Input() maType?: string;
    @Input() maDraggingClass = "madragging";
    @Input() maDraggingSourceClass = "hidden";
    @Input() maDraggableDisabledClass = "disabled";
    @Input() maDragImageOffsetFunction: MaDragImageOffsetFunction = calculateDragImageOffset;
    @Output() readonly maStart: EventEmitter<DragEvent> = new EventEmitter<DragEvent>();
    @Output() readonly maDrag: EventEmitter<DragEvent> = new EventEmitter<DragEvent>();
    @Output() readonly maEnd: EventEmitter<DragEvent> = new EventEmitter<DragEvent>();
    @Output() readonly maMoved: EventEmitter<DragEvent> = new EventEmitter<DragEvent>();
    @Output() readonly maCopied: EventEmitter<DragEvent> = new EventEmitter<DragEvent>();
    @Output() readonly maLinked: EventEmitter<DragEvent> = new EventEmitter<DragEvent>();
    @Output() readonly maCanceled: EventEmitter<DragEvent> = new EventEmitter<DragEvent>();

    @HostBinding("attr.draggable") draggable = true;
    private maHandle?: MaHandleDirective;
    private maDragImageElementRef?: ElementRef;
    private dragImage: Element;
    private isDragStarted: boolean = false;
    private readonly dragEventHandler: (event: DragEvent) => void = (event: DragEvent) => this.onDrag(event);

    @Input() set maDisableIf(value: boolean) {
        this.draggable = !value;
        if (this.draggable) {
            this.renderer.removeClass(this.elementRef.nativeElement, this.maDraggableDisabledClass);
        }
        else {
            this.renderer.addClass(this.elementRef.nativeElement, this.maDraggableDisabledClass);
        }
    }

    @Input() set maDisableDragIf(value: boolean) {
        this.maDisableIf = value;
    }

    constructor(private elementRef: ElementRef, private renderer: Renderer2, private ngZone: NgZone) { }

    ngAfterViewInit(): void {
        this.ngZone.runOutsideAngular(() => {
            this.elementRef.nativeElement.addEventListener("drag", this.dragEventHandler);
        });
    }

    ngOnDestroy(): void {
        this.elementRef.nativeElement.removeEventListener("drag", this.dragEventHandler);
        if (this.isDragStarted === true) {
            endDrag()
        }
    }

    @HostListener("dragstart", ["$event"])
    onDragStart(event: MaEvent) {
        if (this.draggable === false) {
            return false;
        }
        if (typeof this.maHandle !== "undefined"
            && typeof event._maUsingHandle === "undefined") {
            return false;
        }
        startDrag(event, this.maEffectAllowed, this.maType);
        this.isDragStarted = true;
        setDragData(event, { data: this.maDraggable, type: this.maType }, maState.effectAllowed);
        this.dragImage = this.determineDragImage();
        this.renderer.addClass(this.dragImage, this.maDraggingClass); // set dragging css class prior to setDragImage so styles are applied before
        if (typeof this.maDragImageElementRef !== "undefined" || typeof event._maUsingHandle !== "undefined") {
            setDragImage(event, this.dragImage, this.maDragImageOffsetFunction);
        }
        const unregister = this.renderer.listen(this.elementRef.nativeElement, "drag", () => {
            this.renderer.addClass(this.elementRef.nativeElement, this.maDraggingSourceClass);   // add dragging source css class on first drag event
            unregister();
        });
        this.maStart.emit(event);
        event.stopPropagation();
    }

    onDrag(event: DragEvent) {
        this.maDrag.emit(event);
    }

    @HostListener("dragend", ["$event"])
    onDragEnd(event: DragEvent) {
        const dropEffect = maState.dropEffect;
        let dropEffectEmitter: EventEmitter<DragEvent>;
        switch (dropEffect) {
            case "copy":
                dropEffectEmitter = this.maCopied;
                break;
            case "link":
                dropEffectEmitter = this.maLinked;
                break;
            case "move":
                dropEffectEmitter = this.maMoved;
                break;
            default:
                dropEffectEmitter = this.maCanceled;
                break;
        }
        dropEffectEmitter.emit(event);
        this.maEnd.emit(event);
        endDrag();
        this.isDragStarted = false;
        this.renderer.removeClass(this.dragImage, this.maDraggingClass);
        window.setTimeout(() => {
            this.renderer.removeClass(this.elementRef.nativeElement, this.maDraggingSourceClass);
        }, 0);
        event.stopPropagation();
    }

    registerDragHandle(handle: MaHandleDirective | undefined) {
        this.maHandle = handle;
    }

    registerDragImage(elementRef: ElementRef | undefined) {
        this.maDragImageElementRef = elementRef;
    }

    private determineDragImage(): Element {
        if (typeof this.maDragImageElementRef !== "undefined") {
            return this.maDragImageElementRef.nativeElement as Element;
        }
        else {
            return this.elementRef.nativeElement;
        }
    }
}