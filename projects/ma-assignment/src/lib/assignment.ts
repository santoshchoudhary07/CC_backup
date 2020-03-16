export class AssignmentFilter {
	public id: number;
	public name: string;
}

export class Assignment {
	iterationLimit: number = 5;
	id: number;
	type: string;
	name: string;
	detail1: string;
	detail2: string;
	detail3: string;
	detail4: string;
	assigned: boolean;
	filters: AssignmentFilter[];
	order: number;
	filterTypes: AssignmentFilter[];
	assignments: Assignment[] = [];
	parentReference: Assignment;
	assignedChildren: number;
	indeterminate: boolean = false;
	isVisible: boolean = true;
	collapsed: boolean;

	check(event?, parentIndex?, setParentCheckbox?: any, primary?: Assignment, secondary?, override?: boolean, count?: number): void { }
	clear(value: boolean): void { }

	calculatAssignedChildren(): void { }

	updateFilters(assignmentFilter: AssignmentFilter): void { }
}

Assignment.prototype.updateFilters = function (assignmentFilter: AssignmentFilter): void {
	if (this.filters && this.filters[0]) {
		this.isVisible = !assignmentFilter || this.filters[0].id === assignmentFilter.id;
	}
	if (this.isVisible) {
		for (let i = 0; i < this.assignments.length; i++) {
			this.assignments[i].updateFilters(assignmentFilter);
		}
	}
}

Assignment.prototype.calculatAssignedChildren = function (): void {
	this.assignedChildren = this.assignments.reduce((sum, next) => next.assigned ? sum + 1 : sum, 0);
	this.indeterminate = this.assignedChildren !== this.assignments.length && this.assignedChildren !== 0;
};

Assignment.prototype.check = (event?: any, parentIndex?: any, setParentCheckbox?: any, primary?:
	Assignment, secondary?, override?: boolean, count?: number): void => {
	if (parentIndex === -1) {
		if (event) {
			primary.assignments.map((el, index) => {
				el.assigned = true;
				primary.assigned = true;
				primary.indeterminate = false;
				primary.assignedChildren = index + 1;
				return el;
			})
			setParentCheckbox.next({ val: primary.assignments.every(x => x.assigned) });
		}
		else {
			primary.assignments.map((el, index) => {
				el.assigned = false;
				primary.assigned = false;
				primary.indeterminate = false;
				primary.assignedChildren = 0;
				return el;
			})
			setParentCheckbox.next({ val: false });
		}

	}
	else if (primary.isVisible) {
		if (!secondary) {
			if (primary.assigned) {
				primary.assignments.map((el, index) => {
					el.assigned = true;
					primary.assignedChildren = index + 1;
					return el;
				})
			} else {
				primary.assignments.map((el, index) => {
					el.assigned = false;
					primary.assignedChildren = 0;
					primary.indeterminate = false;
					return el;
				})
			}
		} else {
			if (event.currentTarget.checked) {
				primary.assignedChildren = primary.assignedChildren + 1;
				if (primary.assignedChildren !== 0 && primary.assignedChildren !== primary.assignments.length) {
					primary.indeterminate = true;
					primary.assigned = false;
				}
				else if (primary.assignedChildren === primary.assignments.length) {
					primary.indeterminate = false;
					primary.assigned = true;
				}
				else if (primary.assignedChildren === 0) {
					primary.indeterminate = false;
					primary.assigned = false;
				}
			} else {
				primary.assignedChildren = primary.assignedChildren - 1;
				if (primary.assignedChildren !== 0 && primary.assignedChildren !== primary.assignments.length) {
					primary.indeterminate = true;
					primary.assigned = false;
				}
				else if (primary.assignedChildren === primary.assignments.length) {
					primary.indeterminate = false;
					primary.assigned = true;
				}
				else if (primary.assignedChildren === 0) {
					primary.indeterminate = false;
					primary.assigned = false;
				}
			}
		}
		setParentCheckbox.next({ val: primary.assignments.every(x => x.assigned) });
	}
};

Assignment.prototype.clear = function (value: boolean): void {
	if (this.isVisible) {
		if (value) {
			this.assigned = value;
		}
		let blockUpdate: boolean = false;
		for (let i = 0; i < this.assignments.length; i++) {
			if (this.assignments[i].assigned !== value) {
				blockUpdate = true;
			}
		}
		if (!blockUpdate) {
			this.assigned = value;

		}
		if (this.parentReference) {
			this.parentReference.clear(value);
		}
		this.calculatAssignedChildren();
	}
};
