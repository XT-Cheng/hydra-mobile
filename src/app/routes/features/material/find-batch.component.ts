import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { TitleService } from '@core/title.service';
import { ToastService, ToptipsService } from 'ngx-weui';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { of, Subscription, Subject, Observable } from 'rxjs';
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
  protected partSearchResults: Observable<Array<string>> = new Observable();
  protected bufferSearchResults: Observable<Array<string>> = new Observable();

  protected title = `Find Batch`;

  //#endregion

  // #regoin Private member

  private _partSub: Subscription;
  private _partSubject = new Subject<string>();
  private _bufferSub: Subscription;
  private _bufferSubject = new Subject<string>();

  private _debounceTime = 500;

  private _searchingPart = false;
  private _searchingBuffer = false;

  //#endregion

  //#region Constructor

  constructor(
    private _fetchService: NewFetchService,
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
    this._partSub = this._partSubject
      .pipe(debounceTime(this._debounceTime), distinctUntilChanged())
      .subscribe((term: string) => {
        this._searchingPart = true;
        this.searchPart(term);
      });

    this._bufferSub = this._bufferSubject
      .pipe(debounceTime(this._debounceTime), distinctUntilChanged())
      .subscribe((term: string) => {
        this._searchingBuffer = true;
        this.searchBuffer(term);
      });
  }

  ngOnDestroy(): void {
    if (this._partSub) { this._partSub.unsubscribe(); }
    if (this._bufferSub) { this._bufferSub.unsubscribe(); }
  }

  //#endregion

  //#region Event Handler
  startSearchPart() {
    this._partSubject.next(this.inputData.part);
  }

  startSearchBuffer() {
    this._bufferSubject.next(this.inputData.materialBuffer);
  }

  partClicked(part) {
    this._searchingPart = false;
    this.inputData.part = part;
    this._partSubject.next('');
  }

  bufferClicked(buffer) {
    this._searchingBuffer = false;
    this.inputData.materialBuffer = buffer;
    this._bufferSubject.next('');
  }

  //#endregion

  //#region Protected methods

  protected hasNoBufferResult(results) {
    return this._searchingBuffer && results.length <= 0;
  }

  protected hasNoPartResult(results) {
    return this._searchingPart && results.length <= 0;
  }

  protected searchPart(part: string) {
    if (part) {
      this.partSearchResults = this._fetchService.searchBatchPart(part);
    } else {
      this._searchingPart = false;
      this.partSearchResults = of([]);
    }
  }

  protected searchBuffer(buffer: string) {
    if (buffer) {
      this.bufferSearchResults = this._fetchService.searchBatchBuffer(buffer);
    } else {
      this._searchingBuffer = false;
      this.bufferSearchResults = of([]);
    }
  }

  //#endregion

  //#region Exeuction

  searchBatch = () => {
    this.executionContext = {
      material: this.inputData.part,
      bufferName: this.inputData.materialBuffer,
    };
    this.batchs = [];
    return this._fetchService.searchBatch(
      this.inputData.part, this.inputData.materialBuffer
    ).pipe(
      map(ret => {
        this.batchs = ret;
        return {
          isSuccess: true,
          error: '',
          description: '',
          content: ''
        };
      })
    );
  }

  searchBatchSuccess = () => {
    // Nothing to do
  }

  searchBatchFailed = () => {
    // Nothing to do
  }

  //#endregion

  //#region Override methods

  resetForm() {
    this.partElem.nativeElement.focus();
  }

  isValid() {
    return !this._searchingPart && !this._searchingBuffer && (this.inputData.part || this.inputData.materialBuffer);
  }

  //#endregion
}
