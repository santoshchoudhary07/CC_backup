import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MaDynamicModalComponent } from './ma-dynamic-modal.component';

@NgModule({
  declarations: [MaDynamicModalComponent],
  imports: [CommonModule, FormsModule],
  exports: [MaDynamicModalComponent]
})
export class MaDynamicModalModule { }
