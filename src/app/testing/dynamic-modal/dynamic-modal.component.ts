import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dynamic-modal',
  templateUrl: './dynamic-modal.component.html',
  styleUrls: ['./dynamic-modal.component.css']
})
export class DynamicModalComponent implements OnInit {
  isOpen: boolean;
  
  constructor() {
    this.isOpen = true;
  }

  ngOnInit() {
  }

  close() {
    this.isOpen = false;
  }
}
