import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MaRadioButtonComponent } from './ma-radio-button.component';

@NgModule({
  declarations: [MaRadioButtonComponent],
  imports: [CommonModule, FormsModule],
  exports: [MaRadioButtonComponent]
})
export class MaRadioButtonModule { }
