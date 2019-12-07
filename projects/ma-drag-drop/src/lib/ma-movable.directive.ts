import { Directive, HostListener, HostBinding, Input, ElementRef } from '@angular/core';
import { MaDraggableDirective } from './ma-draggable.directive';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

interface Position {
  x: number;
  y: number;
}

@Directive({
  selector: '[ma-movable]'
})
export class MaMovableDirective extends MaDraggableDirective {
  @HostBinding('style.transform') get transform(): SafeStyle {
    return this.sanitizer.bypassSecurityTrustStyle(
      `translateX(${this.position.x}px) translateY(${this.position.y}px)`
    );
  }

  //The transform property applies a 2D or 3D transformation to an element. This property allows you to rotate, scale, move, skew, etc., elements.

  public position: Position = { x: 0, y: 0 };
  private startPosition: Position;

  @Input('appMovableReset') reset = false;

  constructor(private sanitizer: DomSanitizer, public element: ElementRef) {
    super(element);
  }
  //clientX is the position where we drag and this.position is an initial position = 0.

  @HostListener('dragStart', ['$event'])
  ondragStart(event: PointerEvent) {
    this.startPosition = {
      x: event.clientX - this.position.x,
      y: event.clientY - this.position.y
    }
  }

  @HostListener('dragMove', ['$event'])
  ondragMove(event: PointerEvent) {
    this.position.x = event.clientX - this.startPosition.x;
    this.position.y = event.clientY - this.startPosition.y;
  }

  @HostListener('dragEnd', ['$event'])
  onDragEnd() {
    if (this.reset) {
      this.position = { x: 0, y: 0 }
    }
  }
}