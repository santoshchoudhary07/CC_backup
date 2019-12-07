import { NgModule } from '@angular/core';

import { ConfirmPasswordDirective } from './password-confirm.directive';

@NgModule({
  declarations: [ConfirmPasswordDirective],
  exports: [ConfirmPasswordDirective]
})
export class MaPasswordConfirmationModule { }
