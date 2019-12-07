import { Component, Input, Output, EventEmitter, } from '@angular/core';

@Component({
    selector: 'ma-day',
    templateUrl: 'ma-day.component.html'
})
export class MaDayComponent {
    @Input() month: number;
    @Input() day: Date;
    @Input() maxDate: Date;
    @Input() minDate: Date;
    @Input() currentDate: Date;
    @Output() selectedDay = new EventEmitter<Date>();

    constructor() {
        this.day = new Date();
    }

    selectedDate() {
        if (new Date().setHours(0, 0, 0, 0) >= this.day.setHours(0, 0, 0, 0)) {
            this.minDateCheck();
        } else {
            this.maxDateCheck();
        }
    }

    private maxDateCheck(): void {
        let flag = false;
        if (this.day.setHours(0, 0, 0, 0) <= this.maxDate.setHours(0, 0, 0, 0)) {
            if (this.day.getMonth() === this.maxDate.getMonth() && this.day.getFullYear() === this.maxDate.getFullYear()) {
                flag = true;
            }

            if (flag) {
                if (this.day.getDate() <= this.maxDate.getDate()) {
                    this.selectedDay.emit(this.day);
                }
            } else {
                this.selectedDay.emit(this.day);
            }
        }
    }

    private minDateCheck(): void {
        let flag = false;
        if (this.day.setHours(0, 0, 0, 0) >= this.minDate.setHours(0, 0, 0, 0)) {
            if (this.day.getMonth() === this.minDate.getMonth() && this.day.getFullYear() === this.minDate.getFullYear()) {
                flag = true;
            }

            if (flag) {
                if (this.day.getDate() >= this.minDate.getDate()) {
                    this.selectedDay.emit(this.day);
                }
            } else {
                this.selectedDay.emit(this.day);
            }
        }
    }
}
