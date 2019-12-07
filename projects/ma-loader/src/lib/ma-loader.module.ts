import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MaLoaderComponent } from './ma-loader.component';

@NgModule({
  declarations: [MaLoaderComponent],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [MaLoaderComponent]
})
export class MaLoaderModule { }