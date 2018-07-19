import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'layout-header',
  templateUrl: `./header.component.html`,
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @Output('menuClicked') menuClicked: EventEmitter<void>;

  constructor() {
    this.menuClicked = new EventEmitter();
  }

  clicked() {
    this.menuClicked.emit();
  }
}
