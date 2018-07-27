import { Component, HostBinding, ViewChild, ElementRef } from '@angular/core';
import { BapiService } from '@core/hydra/bapi/bapi.service';
import { FetchService } from '@core/hydra/fetch.service';
import { filter } from 'rxjs/operators';
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
    id: '',
    licenseTag: '',
    materialBuffer: '',
    operator: ''
  };

  info: string;

  results: any[] = [];

  constructor(private _bapiService: BapiService, private _fetchService: FetchService,
    private _routeService: Router, private _titleService: TitleService,
    private _tipService: ToptipsService, private _toastService: ToastService) {
    this._routeService.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    ).subscribe(() => {
        this._titleService.setTitle(`批次转移`);
      });
  }

  moveBatch() {
    const result = {
      id: this.data.id,
      licenseTag: this.data.licenseTag,
      materialBuffer: this.data.materialBuffer,
      message: '转移批次...',
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

    // Move Batch
    result.isExecutingBapi = true;
    this._bapiService.moveBatch(result.id, result.materialBuffer, result.operator).subscribe(ret => {
      // Set Status
      result.isExecutingBapi = false;

      result.isSuccess = ret.isSuccess;

      // Update results
      if (result.isSuccess) {
        result.message = `批次: ${result.licenseTag} 转移成功`;
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
      if (ret === null || ret.length === 0) {
        this._tipService['warn'](`批次${this.data.licenseTag}不存在！`);
        this.resetForm();
      } else {
        this.data.id = ret[0].ID;
        this.info = `批次：${ret[0].BATCHNAME},当前位置: ${ret[0].LOCDESC}, 数量：${ret[0].REMAINQUANTITY}`;
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

    this.operatorElem.nativeElement.focus();
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

    this.moveBatch();
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
