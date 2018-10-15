import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { BapiService } from '@core/hydra/bapi/bapi.service';
import { FetchService } from '@core/hydra/fetch.service';
import { Router, NavigationEnd } from '@angular/router';
import { TitleService } from '@core/title.service';
import { ToastService, ToptipsService, DialogService, DialogConfig, PopupComponent } from 'ngx-weui';
import { filter, switchMap, map, tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { of, throwError, Subscription, Subject, Observable } from 'rxjs';
import { NgForm } from '@angular/forms';
import { BatchInfo } from '@core/interface/common.interface';
import { NewFetchService } from '@core/hydra/fetch.new.service';
import { BaseForm } from './features/base.form';
import { IBapiResult } from '@core/hydra/bapi/constants';

@Component({
  selector: 'bapi-test',
  templateUrl: 'bapi.test.component.html',
  styleUrls: ['./bapi.test.component.scss']
})
export class BapiTestComponent extends BaseForm {

  //#region View Children

  @ViewChild('content') contentElem: ElementRef;
  @ViewChild('type') typeElem: ElementRef;

  //#endregion

  //#region Protected member
  protected inputData: any = {
    type: '',
    content: '',
    result: ''
  };

  protected title = `BAPI Test`;

  //#endregion

  // #regoin Private member

  //#endregion

  //#region Constructor

  constructor(
    private _fetchService: NewFetchService,
    private _bapiService: BapiService,
    _routeService: Router,
    _titleService: TitleService,
    _toastService: ToastService,
    _tipService: ToptipsService
  ) {
    super(_toastService, _routeService, _tipService, _titleService);
  }

  //#endregion

  //#region Interface implementation

  //#endregion

  //#region Event Handler

  //#endregion

  //#region Exeuction
  executeBapiSuccess = (ret: IBapiResult) => {
    this.inputData.result = ret.content;
    this.typeElem.nativeElement.focus();
  }

  executeBapiFailed = (err) => {
    this.inputData.result = err;
    this.typeElem.nativeElement.focus();
  }

  executeBapi = () => {
    return this._bapiService.test(this.inputData.type, this.inputData.content);
  }
  //#endregion

  //#region Override methods

  resetForm() {
    this.contentElem.nativeElement.focus();
  }

  isValid() {
    return true;
  }

  //#endregion
}
