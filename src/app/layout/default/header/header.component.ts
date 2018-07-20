import { Component, Output, EventEmitter } from '@angular/core';
import { TitleService } from '@core/title.service';

@Component({
  selector: 'layout-header',
  templateUrl: `./header.component.html`,
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @Output('menuClicked') menuClicked: EventEmitter<void>;

  title = 'Hydra Mobile';

  constructor(private titleService: TitleService) {
    this.menuClicked = new EventEmitter();

    this.titleService.titleChanged.subscribe((title) => this.title = title);
  }

  clicked() {
    this.menuClicked.emit();
  }
}
