import { Component, HostBinding, ViewChild, ElementRef } from '@angular/core';
import { BapiService } from '@core/hydra/bapi/bapi.service';
import { FetchService } from '@core/hydra/fetch.service';
import { switchMap, filter } from 'rxjs/operators';
import { NgForm } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { TitleService } from '@core/title.service';
import { ToastService, ToptipsService } from 'ngx-weui';

@Component({
  selector: 'batch-create',
  templateUrl: 'create-batch.component.html',
  styleUrls: ['./create-batch.component.scss']
})
export class CreateBatchComponent {
  @HostBinding('style.display')
  display = 'flex';
  @HostBinding('style.flex-direction')
  direction = 'column';
  @HostBinding('style.height')
  height = '100%';

  @ViewChild('licenseTag')
  licenseTagElem: ElementRef;
  @ViewChild('materialBuffer')
  materialBufferElem: ElementRef;
  @ViewChild('operator')
  operatorElem: ElementRef;
  @ViewChild('f')
  form: NgForm;

  data: any = {
    batchName: '',
    licenseTag: '',
    materialBuffer: '',
    operator: '',
    materialNumber: '',
    quantity: -1
  };

  licenseTagInfo: string;
  bufferInfo: string;
  operatorInfo: string;

  results: any[] = [];

  constructor(
    private _bapiService: BapiService,
    private _fetchService: FetchService,
    private _routeService: Router,
    private _titleService: TitleService,
    private _toastService: ToastService,
    private _tipService: ToptipsService
  ) {
    this._routeService.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(event => {
        this._titleService.setTitle(`Batch Create`);
      });
  }

  createBatch() {
    const result = {
      batchName: this.data.batchName,
      materialBuffer: this.data.materialBuffer,
      operator: this.data.operator,
      isExecutingBapi: false,
      materialNumber: this.data.materialNumber,
      quantity: this.data.quantity,
      isSuccess: false,
      message: '',
      timeStamp: new Date()
    };

    this.resetForm();

    this.results.unshift(result);

    // Update results
    if (this.results.length > 4) {
      this.results.pop();
    }

    this._toastService['loading']();

    // Create Batch
    result.isExecutingBapi = true;
    this._bapiService
      .createBatch(
        result.batchName,
        result.materialNumber,
        result.quantity,
        result.materialBuffer,
        result.operator
      )
      .pipe()
      .subscribe(
        ret => {
          // Set Status
          result.isExecutingBapi = false;

          result.isSuccess = ret.isSuccess;

          // Update results
          if (result.isSuccess) {
            result.message = `Batch: ${result.batchName} Created!`;
          } else {
            result.message = ret.description;
          }

          this._toastService.hide();
        },
        error => {
          console.log(error);
        }
      );
  }

  resetForm() {
    this.form.reset();
    this.data = {};

    this.bufferInfo = '';
    this.operatorInfo = '';
    this.licenseTagInfo = '';

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
        this.data.batchName = ret.BATCHNAME;
        this.data.materialNumber = ret.PARTNO;
        this.data.quantity = ret.QUANTITY;
        this.licenseTagInfo = `Batch：${this.data.batchName},Mat: ${this.data.materialNumber},Qty: ${this.data.quantity}`;

        return this._fetchService.getBatchInformation(this.data.batchName);
      })
    ).subscribe(ret => {
      this._toastService.hide();
      if (ret !== null && ret.length !== 0) {
        this._tipService['warn'](`Batch ${this.data.batchName} existed！`);
        this.resetForm();
      } else {
        this.materialBufferElem.nativeElement.focus();
      }
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
        // this.createBatch();
      }
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
