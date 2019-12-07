import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MaDragDirective, MaDragImageRefDirective } from './ma-drag.directive';
import { MaDraggableDirective } from './ma-draggable.directive';
import { MaDropDirective, MaPlaceholderRefDirective } from './ma-drop.directive';
import { MaHandleDirective } from './ma-drag-handle.directive';
import { MaMovableDirective } from './ma-movable.directive';
import { MaMovableAreaDirective } from './ma-movable-area.directive';

@NgModule({

    imports: [
        CommonModule,
        FormsModule
    ],

    declarations: [
        MaDragDirective,
        MaDragImageRefDirective,
        MaDraggableDirective,
        MaDropDirective,
        MaHandleDirective,
        MaMovableDirective,
        MaMovableAreaDirective,
        MaPlaceholderRefDirective
    ],

    exports: [
        MaDragDirective,
        MaDragImageRefDirective,
        MaDraggableDirective,
        MaDropDirective,
        MaHandleDirective,
        MaMovableDirective,
        MaMovableAreaDirective,
        MaPlaceholderRefDirective
    ]
})
export class MaDragDropModule { }
