import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { MaInputComponent, MakeProvider } from './ma-input.component';

@Component({
  selector: 'ma-masking',
  template: `
  <input class="field" type="text" ngModel [(maMaskValue)]="value" [maMask]="maskType" [maKeepMask]="!unMaskValue" [id]="id"
  [name]="name" [disabled]="disabled" [required]="required" [readonly]="readOnly" [placeholder]="placeholder ? placeholder : 'Enter value'"
  (unMask)="unMask($event)">
  `,
  styles: [],
  providers: [MakeProvider(MaMaskingComponent)]

})
export class MaMaskingComponent extends MaInputComponent {
  @Input() ngModel: any;
  @Input() maskType: string;
  @Input() unMaskValue: boolean;
  @Input() disabled: boolean;
  @Input() readOnly: boolean;
  @Input() required: boolean;
  @Input() placeholder: string;
  @Input() id: string;
  @Input() name: string;
  @Output() onMaskChange = new EventEmitter<string>();

  constructor() {
    super();
  }

  unMask(value: string): void {
    this.onMaskChange.emit(value);
  }
}
