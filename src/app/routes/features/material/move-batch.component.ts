import { Component, HostBinding, ViewChild, ElementRef } from '@angular/core';
import { BapiService } from '@core/hydra/bapi/bapi.service';
import { FetchService } from '@core/hydra/fetch.service';
import { filter, switchMap } from 'rxjs/operators';
import { NgForm } from '@angular/forms';
import { ToptipsService, ToastService } from 'ngx-weui';
import { TitleService } from '@core/title.service';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'batch-move',
  templateUrl: 'move-batch.component.html',
  styleUrls: ['./move-batch.component.scss']
})
export class MoveBatchComponent {
  @HostBinding('style.display') display = 'flex';
  @HostBinding('style.flex-direction') direction = 'column';
  @HostBinding('style.height') height = '100%';

  @ViewChild('licenseTag') licenseTagElem: ElementRef;
  @ViewChild('materialBuffer') materialBufferElem: ElementRef;
  @ViewChild('operator') operatorElem: ElementRef;
  @ViewChild('f') form: NgForm;

  data: any = {
    licenseTag: '',
    batchName: '',
    materialBuffer: '',
    operator: ''
  };

  batchInfo: string;
  bufferInfo: string;
  operatorInfo: string;

  results: any[] = [];

  constructor(private _bapiService: BapiService, private _fetchService: FetchService,
    private _routeService: Router, private _titleService: TitleService,
    private _tipService: ToptipsService, private _toastService: ToastService) {
    this._routeService.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    ).subscribe(() => {
      this._titleService.setTitle(`Move Batch`);
    });
  }

  moveBatch() {
    const result = {
      batchName: this.data.batchName,
      materialBuffer: this.data.materialBuffer,
      isExecutingBapi: false,
      operator: this.data.operator,
      isSuccess: false,
      message: '',
      timeStamp: new Date()
    };

    this.resetForm();

    this.results.unshift(result);

    this._toastService['loading']();

    // Update results
    if (this.results.length > 4) {
      this.results.pop();
    }

    // Move Batch
    result.isExecutingBapi = true;
    this._bapiService.moveBatch(result.batchName, result.materialBuffer, result.operator).subscribe(ret => {
      // Set Status
      result.isExecutingBapi = false;

      result.isSuccess = ret.isSuccess;

      // Update results
      if (result.isSuccess) {
        result.message = `Batch: ${result.batchName} moved`;
      } else {
        result.message = ret.description;
      }

      this._toastService.hide();
    },
      error => {
        this._tipService['warn'](error);
        this._toastService.hide();
      });
  }

  resetForm() {
    this.form.reset();
    this.data = {};
    this.batchInfo = '';
    this.operatorInfo = '';
    this.bufferInfo = '';

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
        this.batchInfo = `Batch: ${ret[0].BATCHNAME},Current Loc.: ${ret[0].LOCDESC}, Qty：${ret[0].REMAINQUANTITY}`;
        this.materialBufferElem.nativeElement.focus();
      }
    }, err => {
      this._toastService.hide();
      this._tipService['warn'](`Error: ${err}！`);
      this.resetForm();
    });
  }

  MaterialBufferEntered(event) {
    event.preventDefault();

    if (this.data.licenseTag === '') {
      return;
    }

    if (this.data.materialBuffer === '') {
      return;
    }

    this._toastService['loading']();

    this._fetchService
      .getMaterialBuffer(this.data.materialBuffer)
      .subscribe(ret => {
        this._toastService.hide();
        if (ret === null || ret.length === 0) {
          this._tipService['warn'](`Storage ${this.data.materialBuffer} not exist！`);
          this.resetForm();
        } else {
          this.bufferInfo = `Storage: ${ret[0].DESCRIPTION}`;
          this.operatorElem.nativeElement.focus();
        }
      }, err => {
        this._toastService.hide();
        this._tipService['warn'](`Error: ${err}！`);
        this.resetForm();
      });
  }

  OperatorEntered(event) {
    event.preventDefault();

    if (this.data.licenseTag === '') {
      return;
    }

    if (this.data.materialBuffer === '') {
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
        this.moveBatch();
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
