import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TitleService } from '@core/title.service';

@Component({
  selector: 'operator-list',
  templateUrl: 'operatorList.component.html',
  styleUrls: ['./operatorList.component.scss']
})
export class OperatorListComponent {
  constructor(private _routeService: Router, private _titleService: TitleService) {
    this._routeService.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    ).subscribe(() => {
      this._titleService.setTitle(`人员相关`);
    });
  }
}
