import { Component, OnInit, ViewChild, TemplateRef, Output, EventEmitter } from '@angular/core';
// import { AccordionComponent } from '../../ma-accordion/accordion/accordion.component';

@Component({
  selector: 'app-ma-accordion',
  templateUrl: './ma-accordion.component.html',
  styleUrls: ['./ma-accordion.component.css']
})
export class MaAccordionComponent implements OnInit {
  list: any[];
  // @ViewChild('section1') section1: TemplateRef<any>;
  // @ViewChild('section2') section2: TemplateRef<any>;
  // @ViewChild('section3') section3: TemplateRef<any>;
  // @ViewChild('section4') section4: TemplateRef<any>;
  @Output()
  uploaded = new EventEmitter<any>();
  toggle: boolean;
  constructor() { }

  ngOnInit() {
    // this.list = [
    //   { title: 'Key', sectionRef: this.section1, isOpen: true },
    //   { title: 'Loan details', isOpen: true, sectionRef: this.section2},
    //   { title: 'Loan', sectionRef: this.section3 },
    //   { title: 'Notes', sectionRef: this.section4, isDisabled: false }
    // ];
  }

  uploadComplete(toggle) {
    console.log(toggle)
    toggle = !toggle
    this.uploaded.emit(toggle);
  }
}
