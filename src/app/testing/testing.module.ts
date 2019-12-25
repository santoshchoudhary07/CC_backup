import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

import { TableComponent } from './table/table.component';
import { DatePickerComponent } from './date-picker/date-picker.component';
import { MaTextAreaComponent } from './ma-text-area/ma-text-area.component';
import { DateTimeComponent } from './date-time/date-time.component';
import { SelectComponent } from './select/select.component';
import { ModalComponent } from './modal/modal.component';
import { MaskingComponent } from './masking/masking.component';
import { PhotosComponent } from './photos/photos.component';
import { MaTextComponent } from './ma-text/ma-text.component';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { NumbersComponent } from './numbers/numbers.component';
import { MaAccordionComponent } from './ma-accordion/ma-accordion.component';
import { RadioComponent } from './radio/radio.component';
import { PasswordConfirmationComponent } from './password-confirmation/password-confirmation.component';
import { ToggleComponent } from './toggle/toggle.component';
import { MultiSelectComponent } from './multi-select/multi-select.component';

// import { MaSelectModule } from '../ma-select/ma-select.module';

// import { NgPaginationModule } from '../ng-pagination/ng-pagination.module';

// import { MaTableModule } from '../../../projects/ma-table/src/lib/ma-table.module';
// import { MaTableModule } from '../ma-table/ma-table.module';

// import { MaModalModule } from '../ma-modal/ma-modal.module';
import { MaModalModule } from '../../../projects/ma-modal/src/lib/ma-modal.module';

// import { ToggleModule } from '../toggle/toggle.module';
// import { MaToggleModule } from '../../../projects/ma-toggle/src/lib/ma-toggle.module';

// import { MaDatePickerModule } from '../ma-date-picker/ma-date-picker.module';
// import { MaDatePickerModule } from 'ma-date-picker';
import { MaDatePickerModule } from '../../../projects/ma-date-picker/src/lib/ma-date-picker.module';
// import { MaDatePickerModule } from '../../../dist/ma-date-picker';

// import { MaDateTimeModule } from '../ma-date-time/ma-date-time.module';
// import { MaDateTimeModule } from '../../../dist/ma-date-time';
// import { MaDateTimeModule } from '../../../projects/ma-date-time/src/lib/ma-date-time.module';
// import { MaDateTimeModule } from 'ma-date-time';

// import { MaTextAreaModule } from '../ma-text-area/ma-text-area.module';
import { MaTextAreaModule } from '../../../projects/ma-text-area/src/lib/ma-text-area.module';
// import { MaTextAreaModule } from '../../../dist/ma-text-area';
// import { MaTextAreaModule } from 'ma-text-area';


// import { MaPhotoModule } from '../ma-photo/ma-photo.module';
import { MaPhotoModule } from '../../../projects/ma-photo/src/lib/ma-photo.module';
// import { MaPhotoModule } from '../../../dist/ma-photo';

// import { MaTextModule } from '../ma-text/ma-text.module';
import { MaTextModule } from '../../../projects/ma-text/src/lib/ma-text.module';

// import { MaMaskingModule } from '../ma-masking/ma-masking.module';
import { MaMaskingModule } from '../../../projects/ma-masking/src/lib/ma-masking.module';

import { TestingRoutingModule } from './testing-routing.module';

// import { MaAccordionModule } from '../ma-accordion/ma-accordion.module';
import { MaAccordionModule } from '../../../projects/ma-accordion/src/lib/ma-accordion.module';
// import { MaAccordionModule } from '../../../dist/ma-accordion';

// import { MaNumberModule } from '../ma-number/ma-number.module';
// import { MaNumberModule } from '../../../projects/ma-number/src/lib/ma-number.module';

// import { MaCheckboxModule } from '../ma-checkbox/ma-checkbox.module';
import { MaCheckboxModule } from 'projects/ma-checkbox/src/public-api';

// import { MaMultiSelectModule } from '../ma-multi-select/ma-multi-select.module';
// import { MaMultiSelectModule } from '../../../projects/ma-multi-select/src/lib/ma-multi-select.module';

import { MaRadioButtonModule } from 'projects/ma-radio-button/src/public-api';

// import { MaPasswordConfirmationModule } from 'projects/ma-password-confirmation/src/public-api';

// import { CompareDirective } from '../compare.directive';
// import { AutoCompleteComponent } from './auto-complete/auto-complete.component';
import { MaSearchPipe } from './ma-search.pipe';
// import { MaAutoCompleteModule } from 'projects/ma-auto-complete/src/public-api';
import { MaTreeComponent } from './ma-tree/ma-tree.component';
import { PasswordComponent } from './password/password.component';
// import { MaTreeModule } from 'projects/ma-tree/src/public-api';
// import { MaPasswordModule } from 'projects/ma-password/src/public-api';
// import { MaUrlModule } from 'projects/ma-url/src/public-api';
// import { MaCustomPatternModule } from 'projects/ma-custom-pattern/src/public-api';
import { MaUrlComponent } from './ma-url/ma-url.component';
import { DynamicModalComponent } from './dynamic-modal/dynamic-modal.component';
import { MaDynamicModalModule } from 'projects/ma-dynamic-modal/src/public-api';
import { CustomPatternComponent } from './custom-pattern/custom-pattern.component';
import { AutoCompleteComponent } from './auto-complete/auto-complete.component';
import { MaTableModule } from 'projects/ma-table/src/public-api';
import { MaSelectModule } from 'projects/ma-select/src/public-api';
import { PaginationModule } from 'projects/pagination/src/public-api';

@NgModule({
  declarations: [TableComponent, AutoCompleteComponent, MaSearchPipe, DatePickerComponent, DateTimeComponent,
    SelectComponent, ModalComponent, MaskingComponent, ToggleComponent, MaTextAreaComponent, PhotosComponent,
    MaTextComponent, MaAccordionComponent, NumbersComponent, CheckboxComponent, MultiSelectComponent, RadioComponent,
    PasswordConfirmationComponent, MaTreeComponent, PasswordComponent, MaUrlComponent, DynamicModalComponent, CustomPatternComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TestingRoutingModule,
    MaTableModule,
    MaDatePickerModule,
    MaSelectModule,
    MaTextAreaModule,
    MaTextModule,
    MaDynamicModalModule,
    // MaTableTestingModuleModule,
    // MaTableModule,
    // NgPaginationModule,
    // MaSelectModule,
    MaModalModule,
    PaginationModule,
    // // ToggleModule,
    // MaToggleModule,
    // MaDatePickerModule,
    // MaDateTimeModule,
    // MaTextAreaModule,
    MaPhotoModule,
    // MaTextModule,
    MaMaskingModule,
    // MaAccordionModule,
    // MaNumberModule,
    MaCheckboxModule,
    // MaMultiSelectModule,
    MaRadioButtonModule,
    // MaPasswordConfirmationModule,
    // MaAutoCompleteModule,
    // MaTreeModule,
    // MaPasswordModule,
    // MaUrlModule,
    // MaDynamicModalModule,
    // MaCustomPatternModule
  ],
  providers: [MaSearchPipe]
})
export class TestingModule { }
