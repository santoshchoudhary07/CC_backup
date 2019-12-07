import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MaDatePickerComponent } from './ma-date-picker.component';
import { DatePickerComponent } from './date-picker.component';
import { MaDayComponent } from './ma-day.component';
import { FocusDirective } from './focus.directive';

@NgModule({
  declarations: [MaDatePickerComponent, DatePickerComponent, MaDayComponent, FocusDirective],
  imports: [CommonModule, FormsModule],
  exports: [MaDatePickerComponent, DatePickerComponent, MaDayComponent, FocusDirective]
})
export class MaDatePickerModule { }
