import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MaUrlComponent } from './ma-url.component';

@NgModule({
  declarations: [MaUrlComponent],
  imports: [CommonModule, FormsModule],
  exports: [MaUrlComponent]
})
export class MaUrlModule { }
