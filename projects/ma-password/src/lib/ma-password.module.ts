import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MaPasswordComponent } from './ma-password.component';

@NgModule({
  declarations: [MaPasswordComponent],
  imports: [CommonModule, FormsModule],
  exports: [MaPasswordComponent]
})
export class MaPasswordModule { }
