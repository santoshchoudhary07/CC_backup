import { Component, OnInit } from '@angular/core';
import { DemoService } from 'src/app/demo.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
@Component({
  selector: 'app-auto-complete',
  templateUrl: './auto-complete.component.html',
  styleUrls: ['./auto-complete.component.css']
})
export class AutoCompleteComponent implements OnInit {
  list: any[];
  country: any[];
  // name = 4
  profileForm: FormGroup;

  constructor(private demo: DemoService, private fb: FormBuilder) {

  }

  ngOnInit() {
    this.demo.getData().subscribe(item => {
      this.list = item;
    });
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      name: [5, []],
    });
    this.country = [
      { id: 1, name: 'india' },
      { id: 2, name: 'Belgium' },
      { id: 3, name: 'France' },
      { id: 4, name: 'Italy' },
      { id: 5, name: 'Portugal' },
      { id: 6, name: 'Spain' },
      { id: 7, name: 'Switzerland' },
    ]
  }

  maAutoCompleteOnChange(value: any) {
    console.log(value);
  }

  submit() {
    console.log(this.profileForm.value)
  }
}
