import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl, Validators } from '@angular/forms';

@Directive({
  selector: '[shareMin]',
  providers: [{ provide: NG_VALIDATORS, useExisting: MinDirective, multi: true }]
})
export class MinDirective implements Validator {

  @Input() shareMin: number;

  validate(control: AbstractControl): { [key: string]: any } {
    return Validators.min(this.shareMin)(control);
  }
}
