import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-date-time',
  templateUrl: './date-time.component.html',
  styleUrls: ['./date-time.component.css']
})
export class DateTimeComponent implements OnInit {
  date: Date;
  minDate: Date;
  maxDate: Date;
  profileForm: FormGroup;

  constructor(private fb: FormBuilder) {
    // this.date = new Date();
    this.minDate = new Date('05/20/2018');
    this.maxDate = new Date('05/20/2020');

    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      name: [null, []],
    });
  }

  ngOnInit() {
  }

  maDateOnChange(selectedDate: any): void {
    console.log(selectedDate);
  }

  submit() {
    console.log(this.profileForm.value)
  }

}
