import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MaAsteriskDirective } from './ma-asterisk.directive';

@NgModule({
  declarations: [MaAsteriskDirective],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [MaAsteriskDirective]
})
export class MaAsteriskModule { }