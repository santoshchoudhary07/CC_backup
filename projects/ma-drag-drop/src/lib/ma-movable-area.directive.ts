import { Directive, AfterContentInit, QueryList, ContentChildren, ElementRef } from '@angular/core';

import { Subscription } from 'rxjs';
import { MaMovableDirective } from './ma-movable.directive';

interface Boundaries {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

@Directive({
  selector: '[ma-movable-area]'
})

export class MaMovableAreaDirective implements AfterContentInit {
  @ContentChildren(MaMovableDirective) movables: QueryList<MaMovableDirective>;
  private boundaries: Boundaries;
  private subscription: Subscription[] = [];

  constructor(private element: ElementRef) { }

  ngAfterContentInit() {
    this.movables.changes.subscribe(() => {
      this.subscription.forEach(s => s.unsubscribe());
      this.movables.forEach(movable => {
        this.subscription.push(movable.dragStart.subscribe(() => this.measureBoundaries(movable)));
        this.subscription.push(movable.dragMove.subscribe(() => this.maintainBoundaries(movable)));
      });
    });
    this.movables.notifyOnChanges();
  }

  private measureBoundaries(movable: MaMovableDirective) {
    const viewRect: ClientRect = this.element.nativeElement.getBoundingClientRect(); //Movable-area boundaries
    const movableClientReact: ClientRect = movable.element.nativeElement.getBoundingClientRect(); //movable element boundary
    // getBoundingClientRect() method returns the size of an element and its position relative to the viewport.
    // This method returns a DOMRect object with eight properties: left, top, right, bottom, x, y, width, height.

    this.boundaries = {
      minX: viewRect.left - movableClientReact.left + movable.position.x,
      maxX: viewRect.right - movableClientReact.right + movable.position.x,
      minY: viewRect.top - movableClientReact.top + movable.position.y,
      maxY: viewRect.bottom - movableClientReact.bottom + movable.position.y,
    };
  }

  private maintainBoundaries(movable: MaMovableDirective) {
    movable.position.x = Math.max(this.boundaries.minX, movable.position.x);
    movable.position.x = Math.min(this.boundaries.maxX, movable.position.x);
    movable.position.y = Math.max(this.boundaries.minY, movable.position.y);
    movable.position.y = Math.min(this.boundaries.maxY, movable.position.y);
  }
}