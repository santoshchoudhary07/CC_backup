import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'ma-modal',
  template: `
  <div class="popup popup-first" id="popup-alert" [ngClass]="{'popup-open': isModalOpen}">
  <div class="popup-overlay popup-close"></div>
  <div class="popup-inner">
    <div class="popup-head">
      <h1 class="popup-title">{{modalType}}</h1>
      <div class="popup-actions">
        <a (click)="close();" class="popup-close">
          <i class="ico-x-medium-white"></i>
        </a>
      </div>
    </div>
    <div class="popup-body form">
      <div [ngClass]="{'color-success': modalType === 'success', 'color-error': modalType === 'failed', 'color-warning': modalType === 'warning'}">
        <p>{{modalMessage}}</p>
      </div>
      <div class="form-actions">
        <div class="btns-group">
          <ng-container *ngFor="let button of buttonOptions">
            <button class="btn btn-small {{button?.cssClass}}" (click)="close(button)">{{button.buttonName ? button.buttonName: button }}</button>
          </ng-container>
        </div>
      </div>
    </div>
  </div>
</div>
  `
})
export class MaModalComponent implements OnInit {
  @Input() modalType: string;
  @Input() isModalOpen: boolean;
  @Input() modalMessage: string;
  @Input() closeTimeOut: number;
  @Input() buttonOptions: any[] = [];

  @Output() modalClose = new EventEmitter<boolean>(false);
  @Output() buttonClick = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(): void {
    if (this.isModalOpen) {
      this.setTime();
    }
  }

  close(button?: any): void {
    this.isModalOpen = false;
    this.modalClose.emit(true);
    if (button) {
      this.buttonClick.emit(button)
    }
  }

  setTime(): void {
    if (this.buttonOptions && this.buttonOptions.length === 0) {
      setTimeout(() => {
        this.close();
      }, this.closeTimeOut ? this.closeTimeOut : 3000);
    }
  }
}
