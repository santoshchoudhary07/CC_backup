import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'masking',
  templateUrl: './masking.component.html',
  styleUrls: ['./masking.component.css']
})
export class MaskingComponent implements OnInit {
  name: any;
  profileForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.name = '';
  }

  ngOnInit() {
    this.name = 111111111
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      name: [2222222, []],
    });

    // this.profileForm.setValue({name: 1111111111});
    // this.profileForm.controls['name'].setValue(1111111111);
  }

  submit() {
    console.log(this.profileForm.value)
  }

  onMaskChange(value: string): void {
    this.name = value;
    console.log(value);
  }

}
