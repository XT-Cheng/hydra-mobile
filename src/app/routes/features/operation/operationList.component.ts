import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TitleService } from '@core/title.service';

@Component({
    selector: 'operation-list',
    templateUrl: 'operationList.component.html',
    styleUrls: ['./operationList.component.scss']
  })
  export class OperationListComponent {
    constructor(private _routeService: Router, private _titleService: TitleService) {
      this._routeService.events.pipe(
        filter((event) => event instanceof NavigationEnd)
      ).subscribe(() => {
        this._titleService.setTitle(`工单相关`);
      });
    }
  }
