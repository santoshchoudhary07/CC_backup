import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MaTableComponent } from './ma-table.component';
import { MaSearchPipe } from './ma-search.pipe';
import { MaSelectComponent } from './ma-select.component';
import { FocusDirective } from './focus.directive';
import { MaWinsSearchPipe } from './ma-win.pipe';

@NgModule({
  declarations: [MaTableComponent, MaSearchPipe, MaSelectComponent, FocusDirective, MaWinsSearchPipe],
  imports: [FormsModule, CommonModule],
  providers: [MaSearchPipe, MaWinsSearchPipe],
  exports: [MaTableComponent, MaSearchPipe, MaWinsSearchPipe]
})
export class MaTableModule { }
