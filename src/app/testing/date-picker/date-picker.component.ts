import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.css']
})
export class DatePickerComponent implements OnInit {
  date: any;
  minDate: any;
  maxDate: Date;
  end: Date;
  profileForm: FormGroup;

  constructor(private fb: FormBuilder) {
    // this.date = new Date();
    this.minDate = new Date('05/20/2019');
    this.maxDate = new Date('11/20/2019');
  }

  ngOnInit() {
    this.date = new Date('');
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      name: ['', [Validators.required]],
      end: ['', [Validators.required]],
    });
  }

  maDateOnChange(selectedDate: any): void {
    console.log(selectedDate);
    console.log(this.date)
  }

  submit() {
    console.log(this.profileForm.value)
    console.log(this.date);

  }

  blur() {
    console.log(this.profileForm)
  }

}
