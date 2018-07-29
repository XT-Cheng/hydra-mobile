import { Component, HostBinding, ViewChild, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { BapiService } from '@core/hydra/bapi/bapi.service';
import { FetchService } from '@core/hydra/fetch.service';
import { map, switchMap, filter } from 'rxjs/operators';
import { NgForm } from '@angular/forms';
import { throwIfAlreadyLoaded } from '@core/module-import-guard';
import { ToptipsService, ToastService } from 'ngx-weui';
import { Router, NavigationEnd } from '@angular/router';
import { TitleService } from '@core/title.service';

@Component({
  selector: 'batch-split',
  templateUrl: 'split-batch.component.html',
  styleUrls: ['./split-batch.component.scss']
})
export class SplitBatchComponent {
  @HostBinding('style.display') display = 'flex';
  @HostBinding('style.flex-direction') direction = 'column';
  @HostBinding('style.height') height = '100%';

  @ViewChild('licenseTag') licenseTagElem: ElementRef;
  @ViewChild('splittedBatch') splittedBatchElem: ElementRef;
  @ViewChild('splittedQty') splittedQtyElem: ElementRef;
  @ViewChild('operator') operatorElem: ElementRef;
  @ViewChild('f') form: NgForm;

  data: any = {
    id: '',
    licenseTag: '',
    qty: '',
    splittedBatch: '',
    splittedQty: '',
    remainQty: '',
    operator: ''
  };

  info: string;

  results: any[] = [];

  constructor(private _bapiService: BapiService, private _fetchService: FetchService,
    private _routeService: Router, private _titleService: TitleService,
    private _tipService: ToptipsService, private _toastService: ToastService) {
    this._routeService.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this._titleService.setTitle(`批次拆分`);
    });
  }

  splitBatch() {
    const result = {
      id: this.data.id,
      licenseTag: this.data.licenseTag,
      splittedBatch: this.data.splittedBatch,
      splittedQty: this.data.splittedQty,
      remainQty: this.data.remainQty,
      message: '拆分批次...',
      isExecutingBapi: false,
      operator: this.data.operator,
      isSuccess: false,
      timeStamp: new Date()
    };

    this.resetForm();

    this.results.unshift(result);

    this._toastService['loading']();

    // Update results
    if (this.results.length > 4) {
      this.results.pop();
    }

    this._fetchService.getBatchInformation(result.splittedBatch).pipe(
      switchMap(ret => {
        if (ret !== null && ret.length !== 0) {
          result.isExecutingBapi = false;
          result.isSuccess = false;
          result.message = `${result.splittedBatch}已经存在`;
          throw Error(result.message);
        }

        // Split Batch
        result.isExecutingBapi = true;
        return this._bapiService.splitBatch(result.id, result.licenseTag, result.splittedBatch, result.remainQty,
          result.splittedQty, result.operator);
      })).subscribe(ret => {
        // Set Status
        result.isExecutingBapi = false;

        result.isSuccess = ret.isSuccess;

        // Update results
        if (result.isSuccess) {
          result.message = `批次: ${result.splittedBatch}, 数量: ${result.splittedQty} 拆分成功`;
        } else {
          result.message = ret.description;
        }

        this._toastService.hide();
      },
        error => {
          console.log(error);
          this._toastService.hide();
        });
  }

  resetForm() {
    this.form.reset();
    this.data = {};
    this.info = '';

    this.licenseTagElem.nativeElement.focus();
  }

  LicenseTagEntered(event) {
    event.preventDefault();
    if (this.data.licenseTag === '') {
      return;
    }

    this._toastService['loading']();

    this._fetchService.getBatchInformation(this.data.licenseTag).subscribe((ret) => {
      this._toastService.hide();
      if (ret !== null && ret.length === 0) {
        this._tipService['warn'](`批次${this.data.licenseTag}不存在！`);
        this.resetForm();
      } else {
        this.data.id = ret[0].ID;
        this.data.qty = ret[0].REMAINQUANTITY;
        this.info = `批次：${ret[0].BATCHNAME},当前位置: ${ret[0].LOCDESC}, 数量：${ret[0].REMAINQUANTITY}`;
        this.splittedBatchElem.nativeElement.focus();
      }
    });
  }

  SplittedBatchEntered(event) {
    event.preventDefault();

    if (this.data.licenseTag === '') {
      return;
    }

    if (this.data.splittedBatch === '') {
      return;
    }

    this.splittedQtyElem.nativeElement.focus();
  }

  SplittedQtyEntered(event) {
    event.preventDefault();

    if (this.data.licenseTag === '') {
      return;
    }

    if (this.data.splittedBatch === '') {
      return;
    }

    if (this.data.splittedQty === '') {
      return;
    }

    this.data.remainQty = this.data.qty - this.data.splittedQty;
    this.operatorElem.nativeElement.focus();
  }

  OperatorEntered(event) {
    event.preventDefault();

    if (this.data.licenseTag === '') {
      return;
    }

    if (this.data.splittedBatch === '') {
      return;
    }

    if (this.data.splittedQty === '') {
      return;
    }

    if (this.data.operator === '') {
      return;
    }

    this.splitBatch();
  }

  getResultClass(result) {
    return {
      'weui-icon-success': this.showSuccess(result),
      'weui-icon-warn': this.showError(result),
      'weui-loading': this.showLoading(result)
    };
  }

  isDisable() {
    return !this.form.valid;
  }

  showLoading(result): boolean {
    return result.isFetchingLicenseTag || result.isExecutingBapi;
  }

  showSuccess(result): boolean {
    return result.isSuccess;
  }

  showError(result): boolean {
    return !result.isSuccess && !this.showLoading(result);
  }
}
