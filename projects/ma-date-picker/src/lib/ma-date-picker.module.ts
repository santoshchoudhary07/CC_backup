import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MaDatePickerComponent } from './ma-date-picker.component';
import { DatePickerComponent } from './date-picker.component';
import { MaDayComponent } from './ma-day.component';
import { FocusDirective } from './focus.directive';
import { MaskDirective } from './mask.directive';

@NgModule({
  declarations: [MaDatePickerComponent, DatePickerComponent, MaDayComponent, FocusDirective, MaskDirective],
  imports: [CommonModule, FormsModule],
  exports: [MaDatePickerComponent]
})
export class MaDatePickerModule { }
