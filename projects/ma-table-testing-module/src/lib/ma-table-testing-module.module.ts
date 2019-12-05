import { NgModule } from '@angular/core';
import { MaSearchPipe } from './ma-search.pipe';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaSelectComponent } from './ma-select.component';
import { FocusDirective } from './focus.directive';
import { MaTableTestingModuleComponent } from './ma-table.component';

@NgModule({
  declarations: [MaTableTestingModuleComponent, MaSearchPipe, MaSelectComponent, FocusDirective],
  imports: [FormsModule, CommonModule],
  providers: [MaSearchPipe],
  exports: [MaTableTestingModuleComponent, MaSearchPipe]
})
export class MaTableTestingModuleModule { }
