import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, OnChanges, ChangeDetectorRef, AfterViewChecked } from '@angular/core';

import { PhotoModel, Photos } from './photo.model';
import { MaInputComponent, MakeProvider } from './ma-input.component';

const ROTATIONS: number[] = [0, 90, 180, 270];

@Component({
	selector: 'ma-photo-modal',
	templateUrl: 'photo-modal.component.html',
	styles: ['.popup .popup-inner[hidden], .hidden {display: none;} .image-position { text-align: center;} .list-photos .drop-hover + img {	border: 1px solid #025cc9;cursor: move;} .list-photos .link-remove + img{cursor: move;} .img {	float: left;width:  100px;height: 100px;background-position: 50% 50%;background-repeat: no-repeat;background-size: cover;}.list-photos li{width: auto; margin: 5px;position: relative;}'],
	providers: [MakeProvider(PhotosModalComponent)]
})
export class PhotosModalComponent extends MaInputComponent implements OnInit, OnChanges, AfterViewChecked {
	@ViewChild('file', { static: true }) file: ElementRef;
	@Input() ngModel: any[];
	@Input() readOnly: boolean;
	@Input() disabled: boolean;
	@Input() required: boolean;
	@Input() multiple: boolean;
	@Input() isActive: boolean;
	@Input() name: string;
	@Input() id: string;
	@Output() close = new EventEmitter<boolean>();
	@Output() ngModelChange = new EventEmitter<any[]>();

	loading: boolean;
	changed: boolean;
	displayPhotos: any[];
	expandedPhoto: Photos;
	dragIndex: number;
	allowIndex: number;
	dragObject: any;
	rotations = ROTATIONS;
	tempList: any[];
	list: any[];
	temp: any;

	constructor(private changeDetectorRef: ChangeDetectorRef) {
		super();
		this.initialize();
	}

	ngOnInit() {
		this.loading = false;
	}

	ngOnChanges(): void {
		if (this.ngModel && this.ngModel.length > 0) {
			this.displayPhotos = this.ngModel;
			if (this.isActive) {
				this.tempList = [...this.ngModel];
				this.temp = this.ngModel[this.ngModel.length - 1];
				this.listData();
				if (this.list && this.list.length === 0) {
					const event = new MouseEvent('click', { bubbles: true });
					this.file.nativeElement.dispatchEvent(event);
				}

			}
		} else {
			const event = new MouseEvent('click', { bubbles: true });
			this.file.nativeElement.dispatchEvent(event);
		}
	}

	listData(): any {
		this.list = this.ngModel.filter(item => (item.varbinary && item.active && item.string));
	}

	ngAfterViewChecked(): void {
		this.changeDetectorRef.detectChanges();
	}

	processFile(e: any): void {
		const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
		for (const file of files) {
			const reader = new FileReader();
			reader.onload = (data) => {
				this.displayPhotos.push(this.createPhoto(reader.result));
				this.tempList.push(this.createPhoto(reader.result));
			};
			if (file) {
				reader.readAsDataURL(file);
			}
		}
	}

	removePhoto(index: number): void {
		if (this.isActive) {
			if (this.isActive && this.tempList[index]) {
				if (!this.tempList[index].id) {
					this.tempList.splice(index, 1);
				} else {
					this.tempList[index].active = false;
				}
			}
		} else {
			if (this.displayPhotos[index]) {
				this.displayPhotos.splice(index, 1);
				this.changed = true;
			}
		}

	}

	toggleExpansion(photo: Photos): void {
		photo.expanded = !photo.expanded;
		photo.rotationIndex = 0;
		this.expandedPhoto = (photo.expanded ? photo : null);
	}

	toggleRotation(photo: Photos): void {
		if (photo.rotationIndex >= ROTATIONS.length - 1) {
			photo.rotationIndex = 0;
		} else {
			photo.rotationIndex += 1;
		}
	}

	save(): void {
		this.ngModel = [];
		if (this.isActive) {
			this.tempList = [...this.tempList]
		}
		this.ngModelChange.emit(this.isActive ? this.tempList : this.displayPhotos);
		this.close.emit(this.changed);
	}

	cancel(): void {
		this.close.emit(this.changed);
	}

	drop(index: number) {
		this.allowIndex = null;
		if (index !== this.dragIndex) {
			this.listReOrder(this.displayPhotos, this.dragIndex, index);
			this.listReOrder(this.tempList, this.dragIndex, index);
		}
	}

	allowDrop(ev: any, index: number) {
		this.allowIndex = index;
		ev.preventDefault();
	}

	drag(index: number) {
		this.dragIndex = index;
	}

	private createPhoto(base64: any): any {
		const stringify = JSON.stringify(this.temp);
		const temp = JSON.parse(stringify);
		temp.string = base64.split(',')[0] + ',';
		if (this.isActive) {
			temp.id = null;
			temp.active = true;
		}
		temp.varbinary = base64.split(',')[1];
		this.changed = true;
		return temp;
	}

	private initPhotos(index?: number): void {
		this.displayPhotos = [];
		for (let p = 0; p < this.ngModel.length; p++) {
			if (this.ngModel[p].varbinary) {
				this.displayPhotos.push(this.ngModel[p]);
			}
		}
	}

	private listReOrder(list: any[], oldIndex: number, newIndex: number) {
		if (newIndex >= list.length) {
			let k = newIndex - list.length + 1;
			while (k--) {
				list.push(null);
			}
		}
		list.splice(newIndex, 0, list.splice(oldIndex, 1)[0]);
		return list;
	}

	private initialize(): void {
		this.ngModel = [];
		this.displayPhotos = [];
		this.tempList = [];
		this.temp = { varbinary: '', string: '' };
		this.loading = true;
		this.changed = false;
	}
}
