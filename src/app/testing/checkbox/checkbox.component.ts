import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.css']
})
export class CheckboxComponent implements OnInit {
  name: any;
  names: any;

  profileForm: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.name = true;
    this.names = 1
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      name: [null, [Validators.required]],
    });
  }

  maCheckBoxChange(value: boolean) {
    console.log(value);
  }


  submit() {
    console.log(this.profileForm)
  }

}
