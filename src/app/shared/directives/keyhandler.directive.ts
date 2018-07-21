import { Directive, HostListener, Output, EventEmitter, ElementRef, Input } from '@angular/core';

const TAB_KEY_CODE = 9;
const ENTER_KEY_CODE = 13;

@Directive({
  selector: '[shareKeyHandler]'
})
export class KeyHandlerDirective {
  @Output() input: EventEmitter<string> = new EventEmitter<string>();
  @Input('keyHandler') keyHandler: any = null;

  constructor(public elementRef: ElementRef) {
  }

  @HostListener('keydown', ['$event'])
  keyEvent(event) {
    if (event.srcElement.tagName !== 'INPUT') {
      return;
    }

    const code = event.keyCode || event.which;
    if (code === TAB_KEY_CODE) {
      event.preventDefault();
      this.onNext();
      const previousIonElementValue = this.elementRef.nativeElement.children[0].value;
      this.input.emit(previousIonElementValue);
    } else if (code === ENTER_KEY_CODE) {
      event.preventDefault();
      this.onEnter();
      const previousIonElementValue = this.elementRef.nativeElement.children[0].value;
      this.input.emit(previousIonElementValue);
    }
  }

  onEnter() {
    console.log('onEnter()');
    if (!this.keyHandler) {
      return;
    }

    if (!this.keyHandler.nextInputId) {
        return;
    }
    const nextInputElement = document.getElementById(this.keyHandler.nextIonInputId);

    // On enter, go to next input field
    if (nextInputElement && nextInputElement.children[0]) {
      const element: any = nextInputElement.children[0];
      if (element.tagName === 'INPUT') {
        element.focus();
      }
    }
  }

  onNext() {
    console.log('onNext()');
    if (!this.keyHandler) {
        return;
      }

      if (!this.keyHandler.nextInputId) {
          return;
      }

      const nextInputElement = document.getElementById(this.keyHandler.nextIonInputId);

    // On enter, go to next input field
    if (nextInputElement && nextInputElement.children[0]) {
      const element: any = nextInputElement.children[0];
      if (element.tagName === 'INPUT') {
        element.focus();
      }
    }
  }
}
