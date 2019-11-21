import { Component, OnInit } from '@angular/core';
import { DemoService } from '../../demo.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'multi-select',
  templateUrl: './multi-select.component.html',
  styleUrls: ['./multi-select.component.css']
})
export class MultiSelectComponent implements OnInit {
  list: any[];
  name: any[];
  profileForm: FormGroup;

  constructor(private demoSer: DemoService, private fb: FormBuilder) { }

  ngOnInit() {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      name: [[{ id: 1 }, { id: 2 }], [Validators.required]],
    });
    //  this.name = [{
    //   id: 1
    // },
    // {
    //   id: 2
    // }]
    this.name = [{
      body: "quia et suscipit↵suscipit recusandae consequuntur expedita et cum↵reprehenderit molestiae ut ut quas totam↵nostrum rerum est autem sunt rem eveniet architecto",
      id: 1,
      title: "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
      userId: 1
    },
    {
      body: "est rerum tempore vitae↵sequi sint nihil reprehenderit dolor beatae ea dolores neque↵fugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis↵qui aperiam non debitis possimus qui neque nisi nulla",
      id: 2,
      title: "qui est esse",
      userId: 1
    }]
    this.demoSer.getData().subscribe(data => {
      this.list = data;
    });
  }

  onMaMultiSelectChange(selectedList: any[]): void {
    console.log(selectedList);
    console.log(this.name);
  }

  submit() {
    console.log(this.profileForm.value)
  }
}
