import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from "@angular/core";
import { BehaviorSubject } from "rxjs";

import { Assignment, AssignmentFilter } from "./assignment";

@Component({
  selector: "ma-assignment",
  templateUrl: "./ma-assignment.component.html",
  styles: []
})
export class MaAssignmentComponent implements OnInit, OnChanges {
  @Input('assignment') assignment: Assignment;
  @Input('disabled') disabled: boolean;
  @Output('assignmentChange') assignmentChange = new EventEmitter<Assignment>();

  allChecked: boolean;
  isParentIndeterminate: any;
  setParentCheckbox = new BehaviorSubject({ val: false });
  initialized: boolean;
  selectedFilter: AssignmentFilter;

  constructor() {
    this.allChecked = null;
    this.isParentIndeterminate = false;
    this.initialized = true;
  }

  ngOnInit () {
  }

  ngOnChanges () {
    if (this.assignment && this.assignment.assignments && this.assignment.assignments.length > 0) {
      if (this.initialized) {
        this.initializeAssignments(this.assignment);
        this.initialized = false;
      }
    }
  }

  onFilterChange (): void {
    this.assignment.updateFilters(this.selectedFilter);
  }

  async toggleAllChecked (): Promise<void> {
    await this.processToggle();
    this.emitAssignment();
  }

  private async processToggle (): Promise<boolean> {
    for (let i = 0; i < this.assignment.assignments.length; i++) {
      await new Promise(resolve => resolve(this.assignment.assignments[i].check(this.allChecked, -1, this.setParentCheckbox, this.assignment.assignments[i]) as any));
    }
    return true;
  }

  emitAssignment (): void {
    this.assignmentChange.emit(this.assignment);
  }

  trackById (index: number, data: any): string {
    return data.id;
  }


  private initializeAssignments (assignment: Assignment): void {
    this.assignment = this.castToAssignment(assignment);
    this.assignment.assignments.forEach(() => {
      this.setParentCheckbox.subscribe(res => {
        this.allChecked = res.val;
        this.isParentIndeterminate = this.assignment.assignments.every(x => x.assigned) ? false :
          this.assignment.assignments.some(x => x.assignments.some(y => y.assigned)) ? true : false;
      });
    });
    this.allChecked = this.assignment ? this.assignment.assignments.every(x => x.assigned) : false;
  }

  private castToAssignment (assignment: Assignment, parentAssignment?: Assignment): Assignment {
    const result = new Assignment();
    result.id = assignment.id;
    result.name = assignment.name;
    result.type = assignment.type;
    result.detail1 = assignment.detail1;
    result.detail2 = assignment.detail2;
    result.detail3 = assignment.detail3;
    result.detail4 = assignment.detail4;
    result.filters = assignment.filters;
    result.filterTypes = assignment.filterTypes;
    result.assigned = assignment.assigned || (parentAssignment ? parentAssignment.assigned : false);
    result.parentReference = parentAssignment;
    result.order = assignment.order;

    result.assignments = [];
    for (let i = 0; i < assignment.assignments.length; i++) {
      result.assignments.push(
        this.castToAssignment(assignment.assignments[i], result)
      );
    }
    result.calculatAssignedChildren();
    return result;
  }
}
