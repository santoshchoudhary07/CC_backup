import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MaDateTimeComponent } from './ma-date-time.component';
import { DatePickerComponent } from './date-picker.component';
import { MaDayComponent } from './ma-day.component';
import { FocusDirective } from './focus.directive';
import { MaDateComponent } from './ma-date.component';
import { MaSelectComponent } from './ma-select.component';
import { MaskDirective } from './mask.directive';

@NgModule({
  declarations: [MaDateTimeComponent, DatePickerComponent, MaDayComponent, FocusDirective, MaDateComponent, MaSelectComponent, MaskDirective],
  imports: [CommonModule, FormsModule],
  exports: [MaDateTimeComponent, DatePickerComponent, MaDayComponent, FocusDirective, MaDateComponent, MaSelectComponent]
})
export class MaDateTimeModule { }
