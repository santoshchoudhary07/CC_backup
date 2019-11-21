import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.css']
})
export class PasswordComponent implements OnInit {
  pwdPattern = "^[a-z]{8}$";
  pwdForm: FormGroup;
  name: any;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.name = 'dds'
    this.pwdForm = this.fb.group({
      psw: ['', [Validators.required]],
    });
  }

  submit(form: any): void {
    console.log(form.value)
  }

  maPasswordOnChange(value: string): void {
    console.log(value)
    console.log(this.name)
  }
}
