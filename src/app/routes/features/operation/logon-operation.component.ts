import { Component, ViewChild, ElementRef } from '@angular/core';
import { BapiService } from '@core/hydra/bapi/bapi.service';
import { FetchService } from '@core/hydra/fetch.service';
import { Router, NavigationEnd } from '@angular/router';
import { TitleService } from '@core/title.service';
import { ToastService, ToptipsService, DialogService, DialogConfig, PopupComponent } from 'ngx-weui';
import { filter, switchMap } from 'rxjs/operators';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'operation-logon',
  templateUrl: 'logon-operation.component.html',
  styleUrls: ['./logon-operation.component.scss']
})
export class LogonOperationComponent {
  @ViewChild('f') form: NgForm;
  @ViewChild('machine') machineElem: ElementRef;
  @ViewChild('batch') batchElem: ElementRef;
  @ViewChild('operator') operatorElem: ElementRef;
  @ViewChild('nextOperation') nextOperationElem: ElementRef;

  machineInfo: any = {
    machine: '',
    description: '',
    currentOperation: '',
    nextOperation: ''
  };

  loadBatch: any = {
    batchName: '',
    operator: ''
  };

  componentsInfo: any = [];
  constructor(private _bapiService: BapiService, private _fetchService: FetchService,
    private _routeService: Router, private _titleService: TitleService,
    private _tipService: ToptipsService, private _toastService: ToastService) {
    this._routeService.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    ).subscribe(() => {
      this._titleService.setTitle(`工单登录`);
    });
  }

  BatchEntered(event) {
    event.preventDefault();

    if (this.machineInfo.machine === '') {
      return;
    }

    if (this.loadBatch.batchName === '') {
      return;
    }

    this.operatorElem.nativeElement.focus();
  }

  OperatorEntered(event) {
    event.preventDefault();

    if (this.machineInfo.machine === '') {
      return;
    }

    if (this.loadBatch.operator === '') {
      return;
    }

    if (this.loadBatch.batchName === '') {
      this.logonOP();
    } else {
      this.LogonInputBatch();
    }
  }

  LogonInputBatch() {
    let comp: any;
    this._toastService['loading']();

    this._fetchService.getBatchInformation(this.loadBatch.batchName).pipe(
      switchMap(ret => {
        if (ret === null || ret.length === 0) {
          this._tipService['warn'](`批次${this.loadBatch.batchName}不存在！`);
          throw Error(`批次${this.loadBatch.batchName}不存在！`);
        }

        comp = this.componentsInfo.find(c => c.MATERIAL === ret[0].MATERIALNUMBER);

        if (comp) {
          comp.BATCHQTY = ret[0].REMAINQUANTITY;
        }

        return this._bapiService.logonBatch(this.machineInfo.nextOperation, this.machineInfo.machine,
          this.loadBatch.operator, ret[0].ID, ret[0].MATERIALNUMBER);
      })
    ).subscribe(ret => {
      if (!ret.isSuccess) {
        this._tipService['warn'](ret.description);
      }

      if (comp) {
        comp.INPUTBATCH = this.loadBatch.batchName;
      }

      this._toastService.hide();
      this.loadBatch = {};
      this.batchElem.nativeElement.focus();
    }, error => {
      this.loadBatch.batchName = '';
      this.loadBatch.operator = '';
      this._toastService.hide();

      this.batchElem.nativeElement.focus();
    });
  }

  MachineEntered(event) {
    event.preventDefault();

    if (this.machineInfo.machine === '') {
      return;
    }

    this._toastService['loading']();

    this._fetchService.getMachineWithOperation(this.machineInfo.machine).pipe(
      switchMap((ret) => {
        if (!ret.MACHINE) {
          this._tipService['warn'](`设备${this.machineInfo.machine}不存在！`);
          throw Error(`设备${this.machineInfo.machine}不存在！`);
        } else {
          this.machineInfo.machine = ret.MACHINE;
          this.machineInfo.currentOperation = ret.CURRENTOPERATION;
          this.machineInfo.nextOperation = ret.NEXTOPERATION;
          this.machineInfo.description = `当前工单:${this.machineInfo.currentOperation === null ? '空' : this.machineInfo.currentOperation}`;
        }

        return this._fetchService.getComponentOfOperation(this.machineInfo.nextOperation);
      })
    ).subscribe((ret) => {
      this._toastService.hide();
      this.componentsInfo = ret;

      if (this.isMissComponent()) {
        this.batchElem.nativeElement.focus();
      } else {
        this.operatorElem.nativeElement.focus();
      }
    }, (error) => {
      this._toastService.hide();
      this.resetForm();
      this.machineElem.nativeElement.focus();
    });
  }

  logonOP() {
    this._toastService['loading']();
    this._bapiService.logonOperation(this.machineInfo.nextOperation, this.machineInfo.machine,
      this.loadBatch.operator).subscribe(ret => {
        this._tipService['primary'](`工单${this.machineInfo.nextOperation}登录成功！`);
        this._toastService.hide();
        this.resetForm();
    });
  }

  getResultClass(comp) {
    return {
      'weui-icon-success': this.showSuccess(comp),
      'weui-icon-warn': this.showError(comp)
    };
  }

  showSuccess(comp): boolean {
    return comp.INPUTBATCH !== '';
  }

  showError(comp): boolean {
    return comp.INPUTBATCH === '';
  }

  resetForm() {
    this.form.reset();
    this.machineInfo = {};
    this.componentsInfo = [];
    this.machineElem.nativeElement.focus();
  }

  isDisable() {
    return this.machineInfo.currentOperation !== null || !this.form.valid || this.isMissComponent();
  }

  isMissComponent() {
    let isMissing = false;
    this.componentsInfo.forEach(c => {
      if (c.INPUTBATCH === '') {
        isMissing = true;
        return;
      }
    });

    return isMissing;
  }

  logoffBatch(comp) {
    this._toastService['loading']();
    this._bapiService.logoffBatch(this.machineInfo.nextOperation, this.machineInfo.machine, '20120821',
      comp.INPUTBATCH, 0).subscribe(ret => {
        if (!ret.isSuccess) {
          this._tipService['warn'](ret.description);
          this.loadBatch = {};
          this.batchElem.nativeElement.focus();
        } else {
          comp.INPUTBATCH = '';
          comp.BATCHQTY = '';
        }
        this._toastService.hide();
      });
  }

  compDescription(comp) {
    if (comp.INPUTBATCH === ``) {
      return ``;
    } else {
      return `批次:${comp.INPUTBATCH},当前数量：${comp.BATCHQTY}`;
    }
  }
}
