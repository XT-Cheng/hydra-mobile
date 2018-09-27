import { Component, ViewChild, ElementRef } from '@angular/core';
import { BapiService } from '@core/hydra/bapi/bapi.service';
import { FetchService } from '@core/hydra/fetch.service';
import { Router, NavigationEnd } from '@angular/router';
import { TitleService } from '@core/title.service';
import { ToastService, ToptipsService, DialogService, DialogConfig, PopupComponent } from 'ngx-weui';
import { filter, switchMap, map, tap } from 'rxjs/operators';
import { of, throwError } from 'rxjs';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'material-find-batch',
  templateUrl: 'findBatch.component.html',
  styleUrls: ['./findBatch.component.scss']
})
export class FindBatchComponent {
  @ViewChild('f') form: NgForm;
  @ViewChild('part') partElem: ElementRef;
  @ViewChild('buffer') bufferElem: ElementRef;

  queryInfo: any = {
    materialBuffer: '',
    part: '',
  };

  componentsInfo: Array<any> = [];

  constructor(private _bapiService: BapiService, private _fetchService: FetchService,
    private _routeService: Router, private _titleService: TitleService,
    private _tipService: ToptipsService, private _toastService: ToastService) {
    this._routeService.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    ).subscribe(() => {
      this._titleService.setTitle(`Find Batch`);
    });
  }

  PartEntered(event) {

  }

  BufferEntered(event) {
    event.preventDefault();
  }

  FindBatch() {

  }

  resetForm() {
    this.form.reset();
    this.queryInfo = {};
    this.componentsInfo = [];
    this.partElem.nativeElement.focus();
  }

  compDescription(comp) {
    if (comp.INPUTBATCH === ``) {
      return ``;
    } else {
      return `Batch:${comp.INPUTBATCH},Qty: ${comp.BATCHQTY}`;
    }
  }
}
