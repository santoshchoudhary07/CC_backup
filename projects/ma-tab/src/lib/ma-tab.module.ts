import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MaTabComponent } from './ma-tab.component';

@NgModule({
  declarations: [MaTabComponent],
  imports: [
    FormsModule,
    CommonModule,
    RouterModule
  ],
  exports: [MaTabComponent]
})
export class MaTabModule { }