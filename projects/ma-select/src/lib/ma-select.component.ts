import { Component, OnInit, SimpleChanges, Output, Input, EventEmitter, OnChanges } from '@angular/core';

import { MaInputComponent, MakeProvider } from './ma-inputs';

@Component({
  selector: 'ma-select',
  template: `
  <div class="select">
  <div class="fs-dropdown" [ngClass]="{'fs-dropdown-focus fs-dropdown-open': focused, 'fs-dropdown-disabled': disabled}">
    <select tabindex="-1" name="{{name}}" id="{{id}}" class="fs-dropdown-element" [(ngModel)]="ngModel" [disabled]="readOnly || loading"
      [required]="required" (blur)="setFocus(false)">
      <option *ngFor="let option of optionsList" [ngValue]="option">{{option[renderProperty]}}</option>
    </select>
    <button type="button" class="fs-dropdown-selected" (click)="setFocus(true)">{{(selectedOption ? selectedOption[renderProperty] : 'select')}}</button>
    <div class="fs-dropdown-options" tabindex="0" [focus]="focused" (blur)="setFocus(false)" (mouseleave)="allowBlur(true)" (mouseenter)="allowBlur(false)">
      <button *ngFor="let option of optionsList" type="button" class="fs-dropdown-item" [ngClass]="{'fs-dropdown-item_selected': selectedOption == option}"
        (click)="select(option)">
        {{option[renderProperty]}}
      </button>
    </div>
  </div>
</div>
  `,
  styles: [],
  providers: [MakeProvider(MaSelectComponent)]
})
export class MaSelectComponent extends MaInputComponent implements OnInit, OnChanges {
  @Input() ngModel: any;
  @Input() optionsList: any[];
  @Input() optionId: string;
  @Input() renderProperty: string;
  @Input() id: any;
  @Input() name: string;
  @Input() readOnly: boolean;
  @Input() disabled: boolean;
  @Input() disableSelect: boolean;
  @Input() placeholder: any;
  @Input() required: boolean;
  @Input() provideObject: boolean;

  @Output() onMaSelectChange = new EventEmitter<any>();

  selectedOption: any;
  canBlur: boolean;
  focused: boolean;
  loading: boolean;
  initialized: boolean;
  maModel: string;

  constructor() {
    super();
    this.canBlur = true;
   }

  ngOnInit() {
    this.initialize();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.initialize();
    if ((this.initialized && changes.ngModel && changes.ngModel.currentValue !== changes.ngModel.previousValue) ||
      (this.initialized && changes.optionsList && changes.optionsList.currentValue !== changes.optionsList.previousValue)) {
      this.ngOnInit();
    }
  }

  onSelectChange(option: any): void {
    if (option != null) {
      this.selectedOption = option;
    }
  }

  select(option: any): void {
    if (!this.readOnly && !this.disabled) {
      if (!this.disableSelect) {
        this.selectedOption = option;
        this.updateValue();
      }
      this.focused = false;
    }
  }

  allowBlur(status: boolean): void {
    this.canBlur = status;
  }

  setFocus(status: boolean): void {
    if (!this.readOnly && !this.disabled) {
      if (!status && this.canBlur || status) {
        this.focused = !this.focused;
      }
    }
  }

  updateValue(): void {
    this.value = this.ngModel = (this.provideObject ? this.selectedOption : this.selectedOption[this.optionId || 'id']);
    this.onMaSelectChange.emit(this.ngModel);
  }

  IndexOfByKey(key: string, value: any, array: any[]): number {
    let found = -1;
    array.forEach((c, index) => {
      if (value === c[key]) {
        found = index;
        return;
      }
    });
    return found;
  }

  private initialize(): void {
    this.valid = false;
    this.value = this.ngModel;
    if (this.ngModel != null) {
      this.onSelectChange(this.optionsList[this.IndexOfByKey((this.optionId ? this.optionId : 'id'), this.ngModel, this.optionsList)]);
    } else if (this.placeholder) {
      this.selectedOption = {};
      this.selectedOption[this.renderProperty] = this.placeholder;
    } else {
      this.selectedOption = null;
    }
    this.loading = true;
    this.initialized = true;
  }
}
