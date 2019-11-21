import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaMaskingComponent } from './ma-masking.component';
import { MaskDirective } from './mask.directive';

@NgModule({
  declarations: [MaMaskingComponent, MaskDirective],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  exports: [MaMaskingComponent, MaskDirective]
})
export class MaMaskingModule { }
