import { forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, FormControl, Validator } from '@angular/forms';

const noop = () => {
};

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MaInputComponent),
            multi: true,
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => MaInputComponent),
            multi: true,
        }]
};

export abstract class MaInputComponent implements ControlValueAccessor {
    // The internal data model
    private innerValue: any = '';
    valid: boolean;

    // Placeholders for the callbacks which are later provided
    // by the Control Value Accessor
    private onTouchedCallback: () => void = noop;
    private onChangeCallback: (_: any) => void = noop;

    // get accessor
    get value(): any {
        return this.innerValue;
    }

    // set accessor including call the onchange callback
    set value(v: any) {
        if (v !== this.innerValue) {
            this.innerValue = v;
            this.onChangeCallback(v);
        }
    }

    // Set touched on blur
    onBlur(): void {
        this.onTouchedCallback();
    }

    // From ControlValueAccessor interface
    writeValue(value: any): void {
        if (value !== this.innerValue) {
            this.innerValue = value;
        }
    }

    // From ControlValueAccessor interface
    registerOnChange(fn: any): void {
        this.onChangeCallback = fn;
    }

    // From ControlValueAccessor interface
    registerOnTouched(fn: any): void {
        this.onTouchedCallback = fn;
    }

    public validate(c: FormControl): any {
        return (!this.valid) ? null : {
            invalid: {
                valid: false,
            },
        };
    }
}

export function MakeProvider(type: any): any {
    return { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => type), multi: true };
}
