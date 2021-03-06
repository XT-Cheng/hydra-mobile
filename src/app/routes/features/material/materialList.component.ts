import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TitleService } from '@core/title.service';

@Component({
    selector: 'material-list',
    templateUrl: 'materialList.component.html',
    styleUrls: ['./materialList.component.scss']
  })
  export class MaterialListComponent {
    constructor(private _routeService: Router, private _titleService: TitleService) {
      this._routeService.events.pipe(
        filter((event) => event instanceof NavigationEnd)
      ).subscribe(() => {
        this._titleService.setTitle(`物料相关`);
      });
    }
  }
