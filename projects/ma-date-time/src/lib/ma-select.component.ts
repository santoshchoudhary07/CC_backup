import { Component, OnInit, Input, Output, OnChanges, SimpleChanges, EventEmitter } from '@angular/core';

import { MaInputComponent, MakeProvider } from './ma-input.component';

@Component({
    selector: 'ma-selects',
    templateUrl: 'ma-select.component.html',
    providers: [MakeProvider(MaSelectComponent)]
})
export class MaSelectComponent extends MaInputComponent implements OnInit, OnChanges {
    @Input() ngModel: any = null;
    @Input() optionId: string;
    @Input() provideObject: boolean;
    @Input() options: any[];
    @Input() disableSelect: boolean;
    @Input() placeholder: string;
    @Input() readOnly: boolean;
    @Input() disabled: boolean;
    @Input() maModel: string;
    @Input() name: string;
    @Input() id: string;
    @Input() required: boolean;
    @Output() onMaSelectChange = new EventEmitter<any>();

    selectedOption: any;
    canBlur: boolean;
    focused: boolean;
    loading: boolean;
    initialized: boolean;

    constructor() {
        super();
        this.canBlur = true;
        this.options = [{ id: null, name: '' }];
    }

    ngOnInit() {
        this.valid = false;
        this.value = this.ngModel;
        if (this.ngModel != null) {
            this.onSelectChange(this.options[this.indexOfByKey((this.optionId ? this.optionId : 'id'), this.ngModel, this.options)]);
        } else if (this.placeholder) {
            this.selectedOption = {};
            this.selectedOption.name = this.placeholder;
        } else {
            this.selectedOption = null;
        }
        this.loading = true;
        this.initialized = true;
    }

    ngOnChanges(changes: SimpleChanges) {
        if ((this.initialized && changes.ngModel && changes.ngModel.currentValue !== changes.ngModel.previousValue) ||
            (this.initialized && changes.options && changes.options.currentValue !== changes.options.previousValue)
        ) {
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

    private indexOfByKey(key: string, value: any, array: any[]): number {
        let found = -1;
        array.forEach((c, index) => {
            if (value === c[key]) {
                found = index;
                return;
            }
        });
        return found;
    }
}
