import { Component, ViewChild, ElementRef } from '@angular/core';
import { BapiService } from '@core/hydra/bapi/bapi.service';
import { FetchService } from '@core/hydra/fetch.service';
import { Router, NavigationEnd } from '@angular/router';
import { TitleService } from '@core/title.service';
import { ToastService, ToptipsService, DialogService, DialogConfig, PopupComponent } from 'ngx-weui';
import { filter, switchMap, map, tap } from 'rxjs/operators';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'packing-fg',
  templateUrl: 'packing.component.html',
  styleUrls: ['./packing.component.scss']
})
export class PackingComponent {
  @ViewChild('f') form: NgForm;
  @ViewChild('serialNumber') serialNumberElem: ElementRef;
  @ViewChild('box') boxElem: ElementRef;
  @ViewChild('operator') operatorElem: ElementRef;

  packingCount = 2;

  data: any = {
    box: '',
    serialNumber: '',
    operator: ''
  };

  serialNumbers: Array<any> = [];

  constructor(private _bapiService: BapiService, private _fetchService: FetchService,
    private _routeService: Router, private _titleService: TitleService,
    private _tipService: ToptipsService, private _toastService: ToastService) {
    this._routeService.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    ).subscribe(() => {
      this._titleService.setTitle(`成品包装`);
    });
  }

  SerialNumberEntered(event) {
    event.preventDefault();

    if (this.data.serialNumber === '') {
      return;
    }

    this._toastService.loading();
    this._fetchService.getBatchInformation(this.data.serialNumber).pipe(
      tap(ret => {
        if (ret === null || ret.length === 0) {
          throw Error(`批次${this.data.serialNumber}不存在！`);
        }
      })).subscribe(ret => {
        this._toastService.hide();
        this.serialNumbers.push(ret[0]);
        this.data.serialNumber = '';
        if (this.serialNumbers.length >= this.packingCount) {
          this.boxElem.nativeElement.focus();
        }
      }, error => {
        this._toastService.hide();
        this._tipService.warn(error);
        this.data.serialNumber = '';
        this.serialNumberElem.nativeElement.focus();
      });
  }

  BoxEntered(event) {
    event.preventDefault();

    if (this.data.box === '') {
      return;
    }

    this._fetchService.getBatchInformation(this.data.box).pipe(
      tap(ret => {
        if (ret !== null && ret.length > 0) {
          throw Error(`批次${this.data.box}已经存在！`);
        }
      })).subscribe(ret => {
        if (this.serialNumbers.length >= this.packingCount) {
          this.operatorElem.nativeElement.focus();
        } else {
          this.data.serialNumber = '';
          this.serialNumberElem.nativeElement.focus();
        }
      }, error => {
        this._tipService.warn(error);
        this.data.box = '';
        this.boxElem.nativeElement.focus();
      });
  }

  RemoveSerialNumber(serialNumber) {
    this.serialNumbers = this.serialNumbers.filter(sn => sn.BATCHNAME === serialNumber.BATCHANME);
  }

  SerialNumberDescription(serialNumber) {
    return `${serialNumber.BATCHNAME}`;
  }

  OperatorEntered(event) {
    event.preventDefault();

    if (this.data.box === '') {
      return;
    }

    if (this.data.operator === '') {
      return;
    }

    if (this.serialNumbers.length < 1) {
      return;
    }

    this.Packing();
  }

  getResultClass(comp) {
    return {
      'weui-icon-success': true
    };
  }

  isDisable() {
    return this.serialNumbers.length === 0 || !this.form.valid;
  }

  Packing() {
    this._toastService['loading']();

    const toBeMergedIds = [];

    this.serialNumbers.forEach(sn => {
      toBeMergedIds.push(sn.BATCHNAME);
    });

    this._bapiService.mergeBatch(this.data.box, toBeMergedIds, this.data.operator).pipe(
      tap(res => {
        if (!res.isSuccess) {
          throw Error(res.description);
        }
        // res.forEach(element => {
        //   if (!element.isSuccess) {
        //     throw Error(element.description);
        //   }
        // });
      })
    ).subscribe(ret => {
      this._tipService['primary'](`箱号${this.data.box}生成成功！`);
      this._toastService.hide();
      this.resetForm();
    }, err => {
      this._tipService.warn(err);
      this._toastService.hide();
      this.resetForm();
    });
  }

  resetForm() {
    this.form.reset();
    this.data = {};
    this.serialNumbers = [];
    this.serialNumberElem.nativeElement.focus();
  }
}
