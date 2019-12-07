import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

import { PhotoModel, Photos } from './photo.model';
import { MaInputComponent, MakeProvider } from './ma-input.component';

const ROTATIONS: number[] = [0, 90, 180, 270];

@Component({
	selector: 'ma-photo-modal',
	templateUrl: 'photo-modal.component.html',
	styles: ['.popup .popup-inner[hidden], .hidden {display: none;} .image-position { text-align: center;} .list-photos .drop-hover + img {	border: 1px solid #025cc9;cursor: move;} .list-photos .link-remove + img{cursor: move;} .img {	position: relative;float: left;width:  100px;height: 100px;background-position: 50% 50%;background-repeat: no-repeat;background-size: cover;}'],
	providers: [MakeProvider(PhotosModalComponent)]
})
export class PhotosModalComponent extends MaInputComponent implements OnInit {
    @ViewChild('file', { static: true }) file: ElementRef;
	@Input() ngModel: PhotoModel[];
	@Input() readOnly: boolean;
	@Input() disabled: boolean;
	@Input() required: boolean;
	@Input() name: string;
	@Input() id: string;
	@Output() close = new EventEmitter<boolean>();
	@Output() ngModelChange = new EventEmitter<PhotoModel[]>();

	loading: boolean;
	changed: boolean;
	displayPhotos: PhotoModel[];
	expandedPhoto: Photos;
	dragIndex: number;
	allowIndex: number;
	dragObject: any;
	rotations = ROTATIONS;

	constructor() {
		super();
		this.initialize();
	}

	ngOnInit() {
		this.loading = false;
		if (!this.readOnly && !this.ngModel[this.ngModel.length - 1].varbinary) {
			const event = new MouseEvent('click', { bubbles: true });
			this.file.nativeElement.dispatchEvent(event);
		}
		this.initPhotos();
	}

	processFile(e: any): void {
		const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
		for (const file of files) {
			const reader = new FileReader();
			reader.onload = (data) => {
				this.displayPhotos.push(this.createPhoto(reader.result));
			};
			if (file) {
				reader.readAsDataURL(file);
			}
		}
	}

	removePhoto(index: number): void {
		if (this.displayPhotos[index]) {
			this.changed = true;
			this.displayPhotos.splice(index, 1);
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
		this.ngModelChange.emit(this.displayPhotos);
		this.close.emit(this.changed);
	}

	cancel(): void {
		this.close.emit(this.changed);
	}

	drop(index: number) {
		this.allowIndex = null;
		if (index !== this.dragIndex) {
			this.listReOrder(this.displayPhotos, this.dragIndex, index);
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
		const photo = new PhotoModel();
		photo.active = true;
		photo.string = base64.split(',')[0] + ',';
		photo.varbinary = base64.split(',')[1];
		this.changed = true;
		return photo;
	}

	private initPhotos(index?: number): void {
		this.displayPhotos = [];
		for (let p = 0; p < this.ngModel.length; p++) {
			if (this.ngModel[p].varbinary && this.ngModel[p].active) {
				this.displayPhotos.push(this.ngModel[p]);
			}
		}
	}

	private listReOrder(list: PhotoModel[], oldIndex: number, newIndex: number) {
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
		this.ngModel.push(new PhotoModel());
		this.displayPhotos = [];
		this.loading = true;
		this.changed = false;
	}
}
