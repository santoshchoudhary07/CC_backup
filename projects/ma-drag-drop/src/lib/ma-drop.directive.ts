import { ContentChild, Directive, ElementRef, EventEmitter, HostListener, Input, NgZone, Output, Renderer2 } from "@angular/core";
import { MaEvent, DragDropData, getDirectChildElement, getDropData, shouldPositionPlaceholderBeforeElement } from "./ma-utils";
import { getMaType, getDropEffect, isExternalDrag, setDropEffect } from "./ma-state";
import { EffectAllowed } from "./ma-types";
import { MaDropEvent } from './ma-dropevent';

@Directive({
  selector: "[maPlaceholderRef]"
})
export class MaPlaceholderRefDirective {
  constructor(public readonly elementRef: ElementRef) { }
}
@Directive({
  selector: "[maDropzone]"
})

export class MaDropDirective {
  @Input() maDropzone?: string[];
  @Input() maEffectAllowed: EffectAllowed;
  @Input() maAllowExternal: boolean = false;
  @Input() maHorizontal: boolean = false;
  @Input() maDragoverClass: string = "droppable-highlight";
  @Input() maDropzoneDisabledClass = "maDropzoneDisabled";
  @Output() readonly maDragover: EventEmitter<DragEvent> = new EventEmitter<DragEvent>();
  @Output() readonly maDrop: EventEmitter<MaDropEvent> = new EventEmitter<MaDropEvent>();
  @ContentChild(MaPlaceholderRefDirective, /* TODO: add static flag */ {})
  private readonly maPlaceholderRef?: MaPlaceholderRefDirective;
  private placeholder: Element | null = null;
  private disabled: boolean = false;
  private readonly dragEnterEventHandler: (event: DragEvent) => void = (event: DragEvent) => this.onDragEnter(event);
  private readonly dragOverEventHandler: (event: DragEvent) => void = (event: DragEvent) => this.onDragOver(event);
  private readonly dragLeaveEventHandler: (event: DragEvent) => void = (event: DragEvent) => this.onDragLeave(event);

  @Input() set maDisableIf(value: boolean) {
    this.disabled = !!value;
    if (this.disabled) {
      this.renderer.addClass(this.elementRef.nativeElement, this.maDropzoneDisabledClass);
    }
    else {
      this.renderer.removeClass(this.elementRef.nativeElement, this.maDropzoneDisabledClass);
    }
  }

  @Input() set maDisableDropIf(value: boolean) {
    this.maDisableIf = value;
  }

  constructor(private ngZone: NgZone, private elementRef: ElementRef, private renderer: Renderer2) { }

  ngAfterViewInit(): void {
    this.placeholder = this.tryGetPlaceholder();
    this.removePlaceholderFromDOM();
    this.ngZone.runOutsideAngular(() => {
      this.elementRef.nativeElement.addEventListener("dragenter", this.dragEnterEventHandler);
      this.elementRef.nativeElement.addEventListener("dragover", this.dragOverEventHandler);
      this.elementRef.nativeElement.addEventListener("dragleave", this.dragLeaveEventHandler);
    });
  }

  ngOnDestroy(): void {
    this.elementRef.nativeElement.removeEventListener("dragenter", this.dragEnterEventHandler);
    this.elementRef.nativeElement.removeEventListener("dragover", this.dragOverEventHandler);
    this.elementRef.nativeElement.removeEventListener("dragleave", this.dragLeaveEventHandler);
  }

  onDragEnter(event: MaEvent) {
    if (event._maDropzoneActive === true) {   // check if another dropzone is activated
      this.cleanupDragoverState();
      return;
    }
    if (typeof event._maDropzoneActive === "undefined") {     // set as active if the target element is inside this dropzone
      const newTarget = document.elementFromPoint(event.clientX, event.clientY);
      if (this.elementRef.nativeElement.contains(newTarget)) {
        event._maDropzoneActive = true;
      }
    }
    const type = getMaType(event);  // check if this drag event is allowed to drop on this dropzone
    if (this.isDropAllowed(type) === false) {
      return;
    }
    event.preventDefault();   // allow the dragenter
  }

  onDragOver(event: DragEvent) {
    if (event.defaultPrevented) {
      return;
    }
    const type = getMaType(event);   // check if this drag event is allowed to drop on this dropzone
    if (this.isDropAllowed(type) === false) {
      return;
    }
    this.checkAndUpdatePlaceholderPosition(event);
    const dropEffect = getDropEffect(event, this.maEffectAllowed);
    if (dropEffect === "none") {
      this.cleanupDragoverState();
      return;
    }
    event.preventDefault();   // allow the dragover
    setDropEffect(event, dropEffect);  // set the drop effect
    this.maDragover.emit(event);
    this.renderer.addClass(this.elementRef.nativeElement, this.maDragoverClass);
  }

  @HostListener("drop", ["$event"])
  onDrop(event: DragEvent) {
    try {
      const type = getMaType(event); // check if this drag event is allowed to drop on this dropzone
      if (this.isDropAllowed(type) === false) {
        return;
      }
      const data: DragDropData = getDropData(event, isExternalDrag());
      if (this.isDropAllowed(data.type) === false) {
        return;
      }
      event.preventDefault();
      const dropEffect = getDropEffect(event);
      setDropEffect(event, dropEffect);
      if (dropEffect === "none") {
        return;
      }
      const dropIndex = this.getPlaceholderIndex();
      if (dropIndex === -1) {
        return;
      }
      this.maDrop.emit({
        event: event,
        dropEffect: dropEffect,
        isExternal: isExternalDrag(),
        data: data.data,
        index: dropIndex,
        type: type,
      });
      event.stopPropagation();
    }
    finally {
      this.cleanupDragoverState();
    }
  }

  onDragLeave(event: MaEvent) {
    if (typeof event._maDropzoneActive === "undefined") {
      const newTarget = document.elementFromPoint(event.clientX, event.clientY);
      if (this.elementRef.nativeElement.contains(newTarget)) {
        event._maDropzoneActive = true;
        return;
      }
    }
    this.cleanupDragoverState();
    setDropEffect(event, "none");
  }

  private isDropAllowed(type?: string): boolean {
    if (this.disabled === true) {
      return false;
    }
    if (isExternalDrag() === true && this.maAllowExternal === false) {
      return false;
    }      // if drag did not start from our directive and external drag sources are not allowed -> deny it
    if (!this.maDropzone) {
      return true;
    }  // no filtering by types -> allow it
    if (!type) {
      return true;
    }  // no type set -> allow it
    if (Array.isArray(this.maDropzone) === false) {
      throw new Error("maDropzone: bound value to [maDropzone] must be an array!");
    }
    return this.maDropzone.indexOf(type) !== -1;    // if dropzone contains type -> allow it
  }

  private tryGetPlaceholder(): Element | null {
    if (typeof this.maPlaceholderRef !== "undefined") {
      return this.maPlaceholderRef.elementRef.nativeElement as Element;
    }
    return this.elementRef.nativeElement.querySelector("[maPlaceholderRef]");
  }

  private removePlaceholderFromDOM() {
    if (this.placeholder !== null
      && this.placeholder.parentNode !== null) {
      this.placeholder.parentNode.removeChild(this.placeholder);
    }
  }

  //Function checks placeholder and if placeholder found it updates its position.
  private checkAndUpdatePlaceholderPosition(event: DragEvent): void {
    if (this.placeholder === null) {
      return;
    }
    // make sure the placeholder is in the DOM
    if (this.placeholder.parentNode !== this.elementRef.nativeElement) {
      this.renderer.appendChild(this.elementRef.nativeElement, this.placeholder);
    }
    const directChild = getDirectChildElement(this.elementRef.nativeElement, event.target as Element);   // update the position if the event originates from a child element of the dropzone
    // early exit if no direct child or direct child is placeholder
    if (directChild === null || directChild === this.placeholder) {
      return;
    }
    const positionPlaceholderBeforeDirectChild = shouldPositionPlaceholderBeforeElement(event, directChild, this.maHorizontal);
    if (positionPlaceholderBeforeDirectChild) {
      // Insert before only if necessary
      if (directChild.previousSibling !== this.placeholder) {
        this.renderer.insertBefore(this.elementRef.nativeElement, this.placeholder, directChild);
      }
    }
    else {
      // Insert after only if necessary
      if (directChild.nextSibling !== this.placeholder) {
        this.renderer.insertBefore(this.elementRef.nativeElement, this.placeholder, directChild.nextSibling);
      }
    }
  }

  private getPlaceholderIndex(): number | undefined {
    if (this.placeholder === null) {
      return undefined;
    }
    const element = this.elementRef.nativeElement as HTMLElement;
    return Array.prototype.indexOf.call(element.children, this.placeholder);
  }

  private cleanupDragoverState() {
    this.renderer.removeClass(this.elementRef.nativeElement, this.maDragoverClass);
    this.removePlaceholderFromDOM();
  }
}