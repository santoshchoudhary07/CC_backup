import { Component, OnInit } from '@angular/core';
import { DemoService } from '../../demo.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.css']
})
export class SelectComponent implements OnInit {
  // select start
  maSelectOptions = {}
  selectList = [];
  profileForm: FormGroup;
  name: any;
  list = [1, 2, 3, 4, 5]
  hourCounter = new Array(24);

  //select end  
  constructor(private demoSer: DemoService, private fb: FormBuilder) { }

  ngOnInit() {
    this.name = 1;
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      name: [1, [Validators.required]],
    });
    // this.name = 1;
    this.demoSer.getData().subscribe(data => {
      this.selectList = data;
    })
  }


  // init() {
  //   this.maSelectOptions = {
  //     optionsList: this.selectList,
  //     optionId: 'id',
  //     renderProperty: 'title',
  //     id: '',
  //     name: '',
  //     readOnly: false,
  //     disabled: false,
  //     disableSelect: false,
  //     placeholder: '',
  //     required: false,
  //     provideObject: false
  //   };
  // }

  //select begin
  changeProperty(selectedOption: any) {
    console.log(selectedOption)
    console.log(this.name)
  }

  blur() {
    console.log(this.profileForm.value)
  }
  //select end
  submit() {
    console.log(this.profileForm.value)
  }
}
