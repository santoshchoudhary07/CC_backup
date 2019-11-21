import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-ma-text-area',
  templateUrl: './ma-text-area.component.html',
  styleUrls: ['./ma-text-area.component.css']
})
export class MaTextAreaComponent implements OnInit {
  address: string;
  profileForm: FormGroup;

  constructor(private fb: FormBuilder) {
    // this.name = "street 24"
  }

  ngOnInit() {
    this.address = ''
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      name: ['sss', []],
    });
  }

  maTextOnChange(text: string): void {
    console.log(text);
  }

  submit() {
    console.log(this.profileForm.value)
    console.log(this.address)
  }

  blur(form) {
    console.log(form)
  }
}
