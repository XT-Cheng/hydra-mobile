import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TitleService } from '@core/title.service';

@Component({
    selector: 'machine-list',
    templateUrl: 'machineList.component.html',
    styleUrls: ['./machineList.component.scss']
  })
  export class MachineListComponent {
    constructor(private _routeService: Router, private _titleService: TitleService) {
      this._routeService.events.pipe(
        filter((event) => event instanceof NavigationEnd)
      ).subscribe(() => {
        this._titleService.setTitle(`设备相关`);
      });
    }
  }
