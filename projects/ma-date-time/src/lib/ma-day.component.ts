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
    @Input() isMinDateDisabled: boolean;
    @Input() isMaxDateDisabled: boolean;

    constructor() {
        this.day = new Date();
    }

    selectedDate() {
        this.selectedDay.emit(this.day);
    }
}
