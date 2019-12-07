import { HostBinding, HostListener, Directive } from "@angular/core";

import { MaDragDirective } from "./ma-drag.directive";
import { MaEvent } from './ma-utils';

@Directive({
  selector: "[maHandle]"
})
export class MaHandleDirective {
  @HostBinding("attr.draggable") draggable = true;

  constructor(parent: MaDragDirective) {
    parent.registerDragHandle(this);
  }

  @HostListener("dragstart", ["$event"])
  @HostListener("dragend", ["$event"])
  onDragEvent(event: MaEvent) {
    event._maUsingHandle = true;
  }
}