import { Component, OnInit, SimpleChanges, Output, Input, EventEmitter, OnChanges, ChangeDetectorRef, AfterViewChecked } from '@angular/core';

import { MaInputComponent, MakeProvider } from './ma-inputs';
import { ControlValueAccessor } from './control-value-accessor';

@Component({
  selector: 'ma-select',
  templateUrl: './ma-select.component.html',
  providers: [MakeProvider(MaSelectComponent)]
})
export class MaSelectComponent extends MaInputComponent implements OnInit, OnChanges, AfterViewChecked, ControlValueAccessor {
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
  @Output() ngModelChange = new EventEmitter<any>();
  @Output() onMaSelectChange = new EventEmitter<any>();

  selectedOption: any;
  canBlur: boolean;
  focused: boolean;
  loading: boolean;
  initialized: boolean;

  constructor(private cdr: ChangeDetectorRef) {
    super();
    this.canBlur = true;
    this.focused = false;
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((this.initialized && changes.ngModel && changes.ngModel.currentValue !== changes.ngModel.previousValue) ||
      (this.initialized && changes.optionsList && changes.optionsList.currentValue !== changes.optionsList.previousValue)) {
        this.initialize();
    }
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  onSelectChange(option: any): void {
    if (option || option === 0) {
      this.selectedOption = option;
    }
  }

  select(option: any): void {
    option = option === 0 ? option.toString() : option;
    if (!this.readOnly && !this.disabled) {
      if (!this.disableSelect) {
        this.selectedOption = option;
        this.updateValue();
      }
      this.focused = false;
      this.cdr.detectChanges();
    }
  }

  allowBlur(status: boolean): void {
    this.canBlur = status;
  }

  setFocus(status: boolean): void {
    if (!this.readOnly && !this.disabled) {
      if (!status && this.canBlur || status) {
        this.focused = !this.focused;
        this.cdr.detectChanges();
      }
    }
  }

  updateValue(): void {
    this.value = this.ngModel = (this.provideObject ? this.selectedOption : (this.optionId ? this.selectedOption[this.optionId] : (this.selectedOption === 0 ? +this.selectedOption : this.selectedOption)));
    this.ngModelChange.emit(this.ngModel);
    this.onMaSelectChange.emit(this.ngModel);
  }

  IndexOfByKey(key: string, value: any, array: any[]): number {
    let found = -1;
    array.forEach((c, index) => {
      if (value === (key ? c[key] : c)) {
        found = index;
        return;
      }
    });
    return found;
  }

  writeValue(value: any): void {
    if (!this.ngModel && !this.value && (value || value === 0)) {
      this.value = this.ngModel = value;
      this.initialize();
    } else {
      this.value = this.ngModel = value;
    }
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onTouched() { }

  private initialize(): void {
    this.valid = false;
    this.ngModel = this.value;
    if (this.ngModel || this.ngModel === 0) {
      this.onSelectChange(this.optionsList[this.IndexOfByKey(this.optionId ? this.optionId : null, this.ngModel, this.optionsList)]);
    } else {
      this.selectedOption = null;
    }
    this.loading = true;
    this.initialized = true;
  }
}
