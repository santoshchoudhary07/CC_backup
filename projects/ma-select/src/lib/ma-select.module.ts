import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MaSelectComponent } from './ma-select.component';
import { FocusDirective } from './focus.directive';

@NgModule({
  declarations: [MaSelectComponent, FocusDirective],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [MaSelectComponent, FocusDirective]
})
export class MaSelectModule { }
