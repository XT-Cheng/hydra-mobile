import { Component, HostBinding } from '@angular/core';
import { Router } from '@angular/router';
import { TitleService } from '@core/title.service';

@Component({
  selector: 'layout-default',
  templateUrl: `./default.component.html`,
  styleUrls: ['./default.component.scss'],
})
export class LayoutDefaultComponent {
  _status = false;

  constructor(private _router: Router, private _titleService: TitleService) {

  }

  toggleOpened(): void {
    this._status = !this._status;
  }

  gotoOperation() {
    this._router.navigateByUrl('operation').then(() => {
      this._status = false;
    });
  }

  gotoMachine() {
    this._router.navigateByUrl('machine').then(() => {
      this._status = false;
    });
  }

  gotoMaterial() {
    this._router.navigateByUrl('material').then(() => {
      this._status = false;
    });
  }
}
