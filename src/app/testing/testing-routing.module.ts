import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TableComponent } from './table/table.component';
import { SelectComponent } from './select/select.component';
import { ModalComponent } from './modal/modal.component';
import { ToggleComponent } from './toggle/toggle.component';
import { DatePickerComponent } from './date-picker/date-picker.component';
import { DateTimeComponent } from './date-time/date-time.component';
import { MaTextAreaComponent } from './ma-text-area/ma-text-area.component';
import { PhotosComponent } from './photos/photos.component';
import { MaTextComponent } from './ma-text/ma-text.component';
import { MaskingComponent } from './masking/masking.component';
import { MaAccordionComponent } from './ma-accordion/ma-accordion.component';
import { NumbersComponent } from './numbers/numbers.component';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { MultiSelectComponent } from './multi-select/multi-select.component';
import { RadioComponent } from './radio/radio.component';
import { PasswordConfirmationComponent } from './password-confirmation/password-confirmation.component';
import { AutoCompleteComponent } from './auto-complete/auto-complete.component';
import { MaTreeComponent } from './ma-tree/ma-tree.component';
import { PasswordComponent } from './password/password.component';
import { MaUrlComponent } from './ma-url/ma-url.component';
import { DynamicModalComponent } from './dynamic-modal/dynamic-modal.component';
import { CustomPatternComponent } from './custom-pattern/custom-pattern.component';
import { AssignmentComponent } from './assignment/assignment.component';

const routes: Routes = [
  // {
  //   path: '', redirectTo: '/ma-table', pathMatch: 'full'
  // },
  {
    path: '', component: TableComponent
  },
  {
    path: 'select', component: SelectComponent
  },
  {
    path: 'modal', component: ModalComponent
  },
  {
    path: 'toggle', component: ToggleComponent
  },
  {
    path: 'date-picker', component: DatePickerComponent
  },
  {
    path: 'date-time', component: DateTimeComponent
  },
  {
    path: 'text-area', component: MaTextAreaComponent
  },
  {
    path: 'photo', component: PhotosComponent
  },
  {
    path: 'text', component: MaTextComponent
  },
  {
    path: 'masking', component: MaskingComponent
  },
  // {
  //   path: 'accordion', component: MaAccordionComponent
  // },
  {
    path: 'number', component: NumbersComponent
  },
  {
    path: 'checkbox', component: CheckboxComponent
  },
  {
    path: 'multi-select', component: MultiSelectComponent
  },
  {
    path: 'radio', component: RadioComponent
  },
  // {
  //   path: 'password-matching', component: PasswordConfirmationComponent
  // },
  // {
  //   path: 'auto-complete', component: AutoCompleteComponent
  // },
  // {
  //   path: 'tree', component: MaTreeComponent
  // },
  // {
  //   path: 'password', component: PasswordComponent
  // },
  // {
  //   path: 'url', component: MaUrlComponent
  // },
  {
    path: 'dynamic-modal', component: DynamicModalComponent
  },
  {
    path: 'assignment', component: AssignmentComponent
  }
  // {
  //   path: 'custom-pattern', component: CustomPatternComponent
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TestingRoutingModule { }
