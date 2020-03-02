import { Component, OnInit, Input, Output, EventEmitter, OnChanges, OnDestroy } from '@angular/core';

@Component({
  selector: 'ma-dynamic-modal',
  template: `
  <ng-container *ngIf="isModalOpen">
  <div class="popup popup-first" id="popup-alert" [ngClass]="{'popup-open': isModalOpen}">
  <div class="popup-overlay popup-close"></div>
  <div class="popup-inner popup-width">
    <div class="popup-head">
      <h1 class="popup-title">{{title}}</h1>
      <div class="popup-actions">
        <a (click)="close();" class="popup-close">
          <i class="ico-x-medium-white"></i>
        </a>
      </div>
    </div>
    <div class="popup-body">
    <ng-content *ngIf="isModalOpen"></ng-content>
    </div>
  </div>
</div>
</ng-container>
  `,
  styles: ['.popup-width{ width: 800px;}']
})
export class MaDynamicModalComponent implements OnInit {
  @Input() title: string;
  @Input() isModalOpen: boolean;
  @Output() isModalOpenChange = new EventEmitter<boolean>(false);

  constructor() { }

  ngOnInit() {
  }

  close(): void {
    this.isModalOpenChange.emit(false);
  }
}
