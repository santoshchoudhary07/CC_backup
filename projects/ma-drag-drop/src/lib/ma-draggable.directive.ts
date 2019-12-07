import { Directive, HostListener, Output, EventEmitter, HostBinding, ElementRef } from '@angular/core';

@Directive({
  selector: '[ma-draggable]'
})
export class MaDraggableDirective {
  @HostBinding('class.ui-draggable-dragging') dragging = false;

  @Output() dragStart = new EventEmitter<PointerEvent>();
  @Output() dragMove = new EventEmitter<PointerEvent>();
  @Output() dragEnd = new EventEmitter<PointerEvent>();

  constructor(public element: ElementRef) { }

  @HostListener('pointerdown', ['$event'])
  ondrag(event: PointerEvent): void {

    this.dragging = true;
    event.stopPropagation();
    this.dragStart.emit(event);
  }

  @HostListener('document:pointermove', ['$event'])
  onPointerMove(event: PointerEvent): void {
    if (!this.dragging) {
      return;
    }
    this.dragMove.emit(event);
  };

  @HostListener('document:pointerup', ['$event'])
  onPointerUp(event: PointerEvent): void {
    if (!this.dragging) {
      return;
    }

    this.dragging = false;
    this.dragEnd.emit(event);
  }
}