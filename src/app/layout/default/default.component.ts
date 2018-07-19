import { Component, HostBinding } from '@angular/core';

@Component({
  selector: 'layout-default',
  templateUrl: `./default.component.html`,
  styleUrls: ['./default.component.scss'],
})
export class LayoutDefaultComponent {
    _status = false;
    mode = 'slide';
    position = 'left';
    backdrop = true;

    toggleOpened(): void {
      this._status = !this._status;
  }

  openStart() {
      console.log('openStart');
  }

  opened() {
      console.log('opened');
  }

  closeStart() {
      console.log('closeStart');
  }

  closed() {
      console.log('closed');
  }
}
