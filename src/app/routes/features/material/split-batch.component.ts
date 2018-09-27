import { Component, HostBinding, ViewChild, ElementRef } from '@angular/core';
import { BapiService } from '@core/hydra/bapi/bapi.service';
import { FetchService } from '@core/hydra/fetch.service';
import { switchMap, filter } from 'rxjs/operators';
import { NgForm } from '@angular/forms';
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
  @ViewChild('numberOfSplits') numberOfSplitsElem: ElementRef;
  @ViewChild('splittedQty') splittedQtyElem: ElementRef;
  @ViewChild('operator') operatorElem: ElementRef;
  @ViewChild('f') form: NgForm;

  data: any = {
    licenseTag: '',
    batchName: '',
    qty: '',
    numberOfSplits: '',
    splitQty: '',
    remainQty: '',
    operator: ''
  };

  batchInfo: string;
  operatorInfo: string;
  remainQtyInfo: string;

  results: any[] = [];

  constructor(private _bapiService: BapiService, private _fetchService: FetchService,
    private _routeService: Router, private _titleService: TitleService,
    private _tipService: ToptipsService, private _toastService: ToastService) {
    this._routeService.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    ).subscribe(() => {
      this._titleService.setTitle(`Split Batch`);
    });
  }

  splitBatch() {
    const result = {
      licenseTag: this.data.licenseTag,
      batchName: this.data.batchName,
      numberOfSplits: this.data.numberOfSplits,
      splitQty: this.data.splitQty,
      remainQty: this.data.remainQty,
      message: 'Split Batch...',
      isExecutingBapi: false,
      operator: this.data.operator,
      isSuccess: false,
      timeStamp: new Date()
    };

    this.resetForm();

    this.results.unshift(result);

    // this._toastService['loading']();

    // Update results
    if (this.results.length > 4) {
      this.results.pop();
    }

    result.isSuccess = true;
    result.message = `Batch: ${result.batchName} Split Successfully!`;
    this.resetForm();

    // this._fetchService.getBatchInformation(result.splittedBatch).pipe(
    //   switchMap(ret => {
    //     if (ret !== null && ret.length !== 0) {
    //       result.isExecutingBapi = false;
    //       result.isSuccess = false;
    //       result.message = `${result.splittedBatch}已经存在`;
    //       throw Error(result.message);
    //     }

    //     // Split Batch
    //     result.isExecutingBapi = true;
    //     return this._bapiService.splitBatch(result.id, result.licenseTag, result.splittedBatch, result.remainQty,
    //       result.splittedQty, result.operator);
    //   })).subscribe(ret => {
    //     // Set Status
    //     result.isExecutingBapi = false;

    //     result.isSuccess = ret.isSuccess;

    //     // Update results
    //     if (result.isSuccess) {
    //       result.message = `批次: ${result.splittedBatch}, 数量: ${result.splittedQty} 拆分成功`;
    //     } else {
    //       result.message = ret.description;
    //     }

    //     this._toastService.hide();
    //   },
    //     error => {
    //       console.log(error);
    //       this._toastService.hide();
    //     });
  }

  resetForm() {
    this.form.reset();
    this.data = {};
    this.batchInfo = '';
    this.operatorInfo = '';

    this.licenseTagElem.nativeElement.focus();
  }

  LicenseTagEntered(event) {
    event.preventDefault();
    if (this.data.licenseTag === '') {
      return;
    }

    this._toastService['loading']();

    this._fetchService.getLicenseTagFrom2DBarCode(this.data.licenseTag).pipe(
      switchMap(ret => {
        return this._fetchService.getBatchInformation(ret.BATCHNAME);
      })
    ).subscribe((ret) => {
      this._toastService.hide();
      if (ret === null || ret.length === 0) {
        this._tipService['warn'](`Batch ${this.data.batchName} not exsit！`);
        this.resetForm();
      } else {
        this.data.batchName = ret[0].BATCHNAME;
        this.data.qty = ret[0].REMAINQUANTITY;
        this.batchInfo = `Batch: ${ret[0].BATCHNAME},Current Loc.: ${ret[0].LOCDESC}, Qty：${ret[0].REMAINQUANTITY}`;
        this.numberOfSplitsElem.nativeElement.focus();
      }
    }, err => {
      this._toastService.hide();
      this._tipService['warn'](`Error: ${err}！`);
      this.resetForm();
    });
  }

  NumberOfSplitsEntered(event) {
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

    if (this.data.numberOfSplits * this.data.splittedQty > this.data.qty) {
      this._tipService['warn'](`Batch Quantity is not enough!`);
      this.data.splittedQty = '';
      this.splittedQtyElem.nativeElement.focus();
      return;
    }

    this.data.remainQty = this.data.qty - (this.data.numberOfSplits * this.data.splittedQty);
    this.remainQtyInfo = `Remain Qty：${this.data.remainQty}`;

    this.operatorElem.nativeElement.focus();
  }

  OperatorEntered(event) {
    event.preventDefault();

    if (this.data.licenseTag === '') {
      return;
    }

    if (this.data.operator === '') {
      return;
    }

    this._toastService['loading']();

    this._fetchService.getOperator(this.data.operator).subscribe(ret => {
      this._toastService.hide();
      if (ret === null || ret.length === 0) {
        this._tipService['warn'](`Operator ${this.data.operator} not exist！`);
        this.resetForm();
      } else {
        this.operatorInfo = `Operator ${ret[0].NAME}`;
        this.splitBatch();
      }
    }, err => {
      this._toastService.hide();
      this._tipService['warn'](`Error: ${err}！`);
      this.resetForm();
    });
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
