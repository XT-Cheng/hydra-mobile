import { Component, HostBinding, ViewChild, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { BapiService } from '@core/hydra/bapi/bapi.service';
import { FetchService } from '@core/hydra/fetch.service';
import { map, switchMap, filter } from 'rxjs/operators';
import { NgForm } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { TitleService } from '@core/title.service';

@Component({
  selector: 'batch-create',
  templateUrl: 'create-batch.component.html',
  styleUrls: ['./create-batch.component.scss']
})
export class CreateBatchComponent {
  @HostBinding('style.display') display = 'flex';
  @HostBinding('style.flex-direction') direction = 'column';
  @HostBinding('style.height') height = '100%';

  @ViewChild('licenseTag') licenseTagElem: ElementRef;
  @ViewChild('materialBuffer') materialBufferElem: ElementRef;
  @ViewChild('operator') operatorElem: ElementRef;
  @ViewChild('f') form: NgForm;

  data: any = {
    licenseTag: '',
    materialBuffer: '',
    operator: ''
  };

  results: any[] = [];

  constructor(private _bapiService: BapiService, private _fetchService: FetchService,
    private _routeService: Router, private _titleService: TitleService) {
    this._routeService.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this._titleService.setTitle(`批次接收`);
    });
  }

  createBatch() {
    const result = {
      licenseTag: this.data.licenseTag,
      materialBuffer: this.data.materialBuffer,
      operator: this.data.operator,
      message: '查询批次信息...',
      isFetchingLicenseTag: true,
      quantity: 0,
      materialNumber: '',
      isExecutingBapi: false,
      isSuccess: false,
      timeStamp: new Date()
    };

    this.resetForm();

    this.results.unshift(result);

    // Update results
    if (this.results.length > 4) {
      this.results.pop();
    }

    // Fetch LT
    this._fetchService.getBatchInformation(result.licenseTag).pipe(
      switchMap(ret => {
        if (ret !==  null && ret.length !== 0) {
          result.isExecutingBapi = false;
          result.isFetchingLicenseTag = false;
          result.isSuccess = false;
          result.message = `${result.licenseTag}已经存在`;
          throw Error(result.message);
        }

        return this._fetchService.getLicenseTag(result.licenseTag);
      }),
      switchMap(ret => {
        if (ret !== null && ret.length === 0) {
          result.isExecutingBapi = false;
          result.isFetchingLicenseTag = false;
          result.isSuccess = false;
          result.message = `无法获取${result.licenseTag}的信息`;
          throw Error(result.message);
        }

        // Set Status
        result.isFetchingLicenseTag = false;
        result.isExecutingBapi = true;

        // Update results
        result.message =
          `${ret[0].LICENSETAG}创建中...`;
        result.quantity = ret[0].QUANTITY;
        result.materialNumber = ret[0].PARTNO;

        // Issue BAPI
        return this._bapiService.createBatch(result.licenseTag, result.materialNumber, result.quantity,
          result.materialBuffer, result.operator);
      })
    ).subscribe(ret => {
      // Set Status
      result.isFetchingLicenseTag = false;
      result.isExecutingBapi = false;

      result.isSuccess = ret.isSuccess;

      // Update results
      if (result.isSuccess) {
        result.message = `${result.licenseTag}创建成功`;
      } else {
        result.message = ret.description;
      }
    },
      error => {
        console.log(error);
      });
  }

  resetForm() {
    this.form.reset();
    this.data = {};

    this.licenseTagElem.nativeElement.focus();
  }

  LicenseTagEntered(event) {
    event.preventDefault();
    if (this.data.licenseTag === '') {
      return;
    }

    this.materialBufferElem.nativeElement.focus();
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

    this.createBatch();
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
