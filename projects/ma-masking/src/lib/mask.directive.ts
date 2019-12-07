import { Directive, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { NgControl } from '@angular/forms';

import { MaskGenerator } from './mask-generator';

@Directive({
    selector: '[maMask]'
})
export class MaskDirective {
    @Input('maMask')
    public maskType: string;
    @Input('maKeepMask')
    public keepMask: boolean;
    @Input('maMaskValue')
    public set maskValue(value: string) {
        if (value !== this.value) {
            this.value = value;
            this.defineValue();
        }
    }

    @Output('maMaskValueChange')
    public changeEmitter = new EventEmitter<string>();
    @Output() unMask = new EventEmitter<string>();

    @HostListener('input', ['$event'])
    public onInput(event: { target: { value?: string } }): void {
        let target = event.target;
        let value = target.value;
        this.onValueChange(value);
    }

    public maskGenerator: MaskGenerator = {
        generateMask: () => `${this.maskType}`
      }

    private readonly ALPHA = 'A';
    private readonly NUMERIC = '0';
    private readonly ALPHANUMERIC = '&';
    private readonly REGEX_MAP = new Map([
        [this.ALPHA, /^[A-Za-z]+$/],
        [this.NUMERIC, /\d/],
        [this.ALPHANUMERIC, /\w|\d/],
    ]);

    private value: string = null;
    private displayValue: string = null;

    constructor(private ngControl: NgControl) { }

    private updateValue(value: string) {
        this.value = value;
        this.changeEmitter.emit(value);
        this.delay().then(
            () => this.ngControl.control.updateValueAndValidity()
        );
    }

    private defineValue() {
        let value: string = this.value;
        let displayValue: string = null;
        if (this.maskGenerator) {
            let mask = this.maskGenerator.generateMask(value);

            if (value != null) {
                displayValue = this.mask(value, mask);
                value = this.processValue(displayValue, mask, this.keepMask);
            }
        } else {
            displayValue = this.value;
        }

        this.delay().then(() => {
            if (this.displayValue !== displayValue) {
                this.displayValue = displayValue;
                this.ngControl.control.setValue(displayValue);
                return this.delay();
            }
        }).then(() => {

            if (value != this.value) {
                return this.updateValue(value);
            }
        });
    }

    private onValueChange(newValue: string) {
        if (newValue !== this.displayValue) {
            let displayValue = newValue;
            let value = newValue;
            if ((newValue == null) || (newValue.trim() === '')) {
                value = null;
            } else if (this.maskGenerator) {
                let mask = this.maskGenerator.generateMask(newValue);
                displayValue = this.mask(newValue, mask);
                value = this.processValue(displayValue, mask, this.keepMask);
                this.unMask.emit(value);
            }
            this.displayValue = displayValue;
            if (newValue !== displayValue) {
                this.ngControl.control.setValue(displayValue);
            }
            if (value !== this.value) {
                this.updateValue(value);
            }
        }
    }

    private processValue(displayValue: string, mask: string, keepMask: boolean) {
        let value = keepMask ? displayValue : this.unmask(displayValue, mask);
        return value;
    }

    private mask(value: string, mask: string): string {
        value = value.toString();
        let len = value.length;
        let maskLen = mask.length;
        let pos = 0;
        let newValue = '';
        for (let i = 0; i < Math.min(len, maskLen); i++) {
            let maskChar = mask.charAt(i);
            let newChar = value.charAt(pos);
            let regex: RegExp = this.REGEX_MAP.get(maskChar);
            if (regex) {
                pos++;
                if (regex.test(newChar)) {
                    newValue += newChar;
                } else {
                    i--;
                    len--;
                }
            } else {
                if (maskChar === newChar) {
                    pos++;
                } else {
                    len++;
                }
                newValue += maskChar;
            }
        }
        return newValue;
    }

    private unmask(maskedValue: string, mask: string): string {
        let maskLen = (mask && mask.length) || 0;
        return maskedValue.split('').filter(
            (currChar, idx) => (idx < maskLen) && this.REGEX_MAP.has(mask[idx])
        ).join('');
    }

    private async delay(ms: number = 0): Promise<void> {
        return new Promise(resolve => setTimeout(() => resolve(), ms)).then(() => null);
    }
}
