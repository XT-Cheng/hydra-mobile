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
import { BaseForm } from '../base.form';
import { NewFetchService } from '@core/hydra/fetch.new.service';

@Component({
  selector: 'batch-find',
  templateUrl: 'find-batch.component.html',
  styleUrls: ['./find-batch.component.scss']
})
export class FindBatchComponent extends BaseForm implements OnInit, OnDestroy {

  //#region View Children

  @ViewChild('part') partElem: ElementRef;

  //#endregion

  //#region Protected member
  protected inputData: any = {
    materialBuffer: '',
    part: '',
  };

  protected batchs: Array<BatchInfo> = [];
  protected searchResults: Observable<Array<string>> = new Observable();

  protected title = `Adjust Batch Qty`;

  //#endregion

  // #regoin Private member

  private _sub: Subscription;
  private _subject = new Subject<string>();
  private _debounceTime = 500;

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

  ngOnInit() {
    this._sub = this._subject
      .pipe(debounceTime(this._debounceTime), distinctUntilChanged())
      .subscribe((term: string) => {
        this.search(term);
      });
  }

  ngOnDestroy(): void {
    if (this._sub) { this._sub.unsubscribe(); }
  }

  //#endregion

  //#region Event Handler
  startSearch() {
    this._subject.next(this.inputData.part);
  }

  search(term: string) {
    if (term) {
      this.searchResults = this._fetchService.getBatchMaterial(term);
    } else {
      this.searchResults = of([]);
    }
  }

  partClicked(part) {
    this.inputData.part = part;
    this._subject.next('');
  }

  //#endregion

  //#region Exeuction

  findBatch() {

  }
  //#endregion

  //#region Override methods

  resetForm() {
    this.partElem.nativeElement.focus();
  }

  isValid() {
    return true;
  }

  //#endregion
}
