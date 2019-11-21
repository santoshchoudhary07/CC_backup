import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit {
  modalOpen: boolean = true;
  buttonList: any[];

  constructor() {
    this.buttonList = [
      { buttonName: 'Cancel', value: false, cssClass: 'cancel-button-css-class' },
      { buttonName: 'Continue', value: true, cssClass: 'continue-button-css-class' },
      { buttonName: 'Save', value: 'Save', cssClass: 'cancel-button-css-class' }
    ]
  }

  ngOnInit(): void {
  }

  modalClose(button: any): void {
    console.log(button)
  }
}
