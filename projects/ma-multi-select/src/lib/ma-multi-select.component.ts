import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';

import { MaInputComponent, MakeProvider } from './ma-input.component';

@Component({
  selector: 'ma-multi-select',
  templateUrl: './ma-multi-select.html',
  providers: [MakeProvider(MaMultiSelectComponent)],
  styles: ['.form-controls .select select{height: 175px;border: 1px solid #bbb;border-radius: 0;box-shadow: none;width: 100%;}']
})
export class MaMultiSelectComponent extends MaInputComponent implements OnInit, OnChanges {
  @Input() multiSelectList: any[];
  @Input() ngModel: any[];
  @Input() renderProperty: string;
  @Input() availableLabel: string;
  @Input() selectedLabel: string;
  @Input() optionId: string;
  @Input() disabled: boolean;
  @Input() readonly: boolean;
  @Input() required: boolean;
  @Input() name: string;
  @Input() id: string;
  @Input() formControlName: any;
  @Output() ngModelChange = new EventEmitter<any[]>();
  @Output() onMaMultiSelectChange = new EventEmitter<any[]>();

  loading: boolean;
  selectedList: any[];
  forSelectList: any[];
  forAvailableList: any[];

  constructor() {
    super();
    this.initialize();
  }

  ngOnInit() {
  }

  ngOnChanges(): void {
    this.onCheckList();
  }

  select(): void {
    for (let i = 0; i < this.forSelectList.length; i++) {
      if (this.selectedList.indexOf(this.forSelectList[i]) === -1) {
        this.selectedList.push(this.forSelectList[i]);
        this.onSelectChange();
      }
    }
  }

  deSelect(): void {
    if (this.selectedList && this.selectedList.length) {
      for (let i = this.selectedList.length - 1; i >= 0; i--) {
        if (this.forAvailableList.indexOf(this.selectedList[i]) >= 0) {
          this.selectedList.splice(i, 1);
          this.onSelectChange();
        }
      }
    }
  }

  private indexOfByKey(key: string, value: any, array: any[]): number {
    let found = -1;
    array.forEach((c, index) => {
      if (value[key] === c[key]) {
        found = index;
        return;
      }
    });
    return found;
  }

  private onSelectChange(): void {
    let optionIdList = [];
    if (this.optionId) {
      this.selectedList.forEach(element => {
        optionIdList.push({ [this.optionId]: element[this.optionId] });
      });
    }
    this.value = this.optionId ? optionIdList : this.selectedList;
    this.ngModelChange.emit(this.optionId ? optionIdList : this.selectedList);
    this.onMaMultiSelectChange.emit(this.optionId ? optionIdList : this.selectedList);
  }

  private onCheckList(): void {
    if (this.multiSelectList && this.multiSelectList.length > 0) {
      this.loading = false;
      if (this.optionId && (this.ngModel && this.ngModel.length > 0) || this.value) {
        this.ngModel = this.formControlName ? this.value : this.ngModel;
        this.selectedList = [];
        this.ngModel.forEach(element => {
          this.selectedList.push(this.multiSelectList[this.indexOfByKey(this.optionId, element, this.multiSelectList)]);
        });

      } else {
        this.selectedList = [];
      }
    }
  }

  private initialize(): void {
    this.loading = true;
    this.selectedList = [];
    this.forSelectList = [];
    this.forAvailableList = [];
  }
}
