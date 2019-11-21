import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-ma-url',
  templateUrl: './ma-url.component.html',
  styleUrls: ['./ma-url.component.css']
})
export class MaUrlComponent implements OnInit {
  urlPattern = "(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})";
  urlForm: FormGroup; 
  name: any;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    // this.name = '1234'
    this.urlForm = this.fb.group({
      url: ['', [Validators.required]],
    });
  }

  submit(form: any): void {
    console.log(form.value)
  }

  maUrlOnChange(value: string): void {
    console.log(value)
  }
}
