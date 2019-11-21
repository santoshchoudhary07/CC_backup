import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-custom-pattern',
  templateUrl: './custom-pattern.component.html',
  styleUrls: ['./custom-pattern.component.css']
})
export class CustomPatternComponent implements OnInit {
  pwdPattern = "^[a-z]{8}$";

  constructor() { }

  ngOnInit() {
  }

  submit(form: any): void {
    console.log(form)
  }

  maCustomPatternOnChange(value: string): void {
    console.log(value)
  }
}
