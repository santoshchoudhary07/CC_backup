import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { MakeProvider, MaInputComponent } from './ma-inputs';

@Component({
  selector: 'ma-toggle',
  template: `
 <div class="checkbox-toggle">
    <div class="form-controls">
        <input type="checkbox" name="{{name}}" id="{{id}}}" [(ngModel)]="value" [disabled]="disabled" [readonly]="readonly" [required]="required">
        <label for="{{id}}" (click)="toggle();">
            <ng-container *ngIf="toggleTextName && toggleTextName.length>0; else elseTemplate">
                <span *ngFor="let d of toggleTextName">{{d}}</span>
            </ng-container>
            <ng-template #elseTemplate>
                <span>No</span>
                <span>Yes</span>
            </ng-template>
        </label>
    </div>
</div>
  `,
  providers: [MakeProvider(MaToggleComponent)]
})
export class MaToggleComponent extends MaInputComponent implements OnInit {
  @Input() ngModel: boolean;
  @Input() readonly: boolean;
  @Input() disabled: boolean;
  @Input() toggleTextName: string[];
  @Input() name: string;
  @Input() id: string;
  @Input() required: boolean;
  @Output() maToggleOnChange = new EventEmitter<boolean>();
  @Output() ngModelChange = new EventEmitter<boolean>();

  constructor() { super(); }

  ngOnInit() {
  }

  toggle(): void {
    if (!this.readonly && !this.disabled) {
      this.value = !this.value;
      this.updateValue();
    }
  }

  updateValue(): void {
    this.ngModel = this.value;
    this.ngModelChange.emit(this.ngModel);
    this.maToggleOnChange.emit(this.ngModel);
  }
}
