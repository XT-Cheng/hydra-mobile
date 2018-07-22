import { Component } from '@angular/core';
import { BapiService } from '@core/hydra/bapi/bapi.service';
import { FetchService } from '@core/hydra/fetch.service';

@Component({
  selector: 'operation-logon',
  templateUrl: 'logon-operation.component.html',
  styleUrls: ['./logon-operation.component.scss']
})
export class LogonOperationComponent {
  data: any = {
    machine: ''
  };

  constructor(private _fetchService: FetchService, private _bapiService: BapiService) {

  }

  logonOP() {

  }

  enter(event) {
    console.log('Entered!');
  }
}
