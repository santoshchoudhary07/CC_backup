import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-ma-text',
  templateUrl: './ma-text.component.html',
  styleUrls: ['./ma-text.component.css']
})
export class MaTextComponent implements OnInit {
  name: string;
  profileForm: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.name = '';
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      name: ['', [Validators.required]],
    });
  }

  maTextOnChange(text: string): void {
    console.log(text);
  }

  fun(): void {
    console.log(this.name);
  }

  submit() {
    console.log(this.profileForm.value);
    console.log(this.profileForm);
  }

  get formControls() { return this.profileForm.controls; }

  blur() {
    console.log(this.profileForm);
  }
}
