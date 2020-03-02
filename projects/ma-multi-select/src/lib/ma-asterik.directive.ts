import { Directive, ElementRef, Renderer2, OnInit } from '@angular/core';

@Directive({
    selector: '[ma-asterisk]'
})
export class AsteriskDirective implements OnInit {

    constructor(private elRef: ElementRef, private renderer: Renderer2) { }

    ngOnInit() {
        this.getLoader();
    }

    getLoader() {
        const span = this.renderer.createElement('span');
        const asterisk = this.renderer.createText('*');
        span.classList.add("form-asterisk");
        span.setAttribute("style", "margin-left:1px;");
        this.renderer.appendChild(span, asterisk);
        this.renderer.appendChild(this.elRef.nativeElement, span);
    }

}