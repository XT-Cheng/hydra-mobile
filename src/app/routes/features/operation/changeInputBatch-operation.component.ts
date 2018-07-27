import { Component, ViewChild, ElementRef } from '@angular/core';
import { BapiService } from '@core/hydra/bapi/bapi.service';
import { FetchService } from '@core/hydra/fetch.service';
import { Router, NavigationEnd } from '@angular/router';
import { TitleService } from '@core/title.service';
import { ToastService, ToptipsService, DialogService, DialogConfig, PopupComponent } from 'ngx-weui';
import { filter, switchMap, map, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'operation-change-input-batch',
  templateUrl: 'changeInputBatch-operation.component.html',
  styleUrls: ['./changeInputBatch-operation.component.scss']
})
export class ChangeInputBatchComponent {
  @ViewChild('f') form: NgForm;
  @ViewChild('machine') machineElem: ElementRef;
  @ViewChild('batch') batchElem: ElementRef;
  @ViewChild('operator') operatorElem: ElementRef;
  @ViewChild('currentOperation') currentOperationElem: ElementRef;

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

  componentsInfo: Array<any> = [];

  constructor(private _bapiService: BapiService, private _fetchService: FetchService,
    private _routeService: Router, private _titleService: TitleService,
    private _tipService: ToptipsService, private _toastService: ToastService) {
    this._routeService.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    ).subscribe(() => {
      this._titleService.setTitle(`工单续料`);
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
      return;
    }

    this.ChangeInputBatch();
  }

  ChangeInputBatch() {
    let found: any;
    let uploadBatch: any;
    this._toastService['loading']();

    this._fetchService.getBatchInformation(this.loadBatch.batchName).pipe(
      switchMap(ret => {
        if (ret === null || ret.length === 0) {
          this._tipService['warn'](`批次${this.loadBatch.batchName}不存在！`);
          throw Error(`批次${this.loadBatch.batchName}不存在！`);
        }

        uploadBatch = ret[0];

        const comp = this.componentsInfo.find(c => c.MATERIAL === uploadBatch.MATERIALNUMBER);

        if (comp) {
          found = Object.assign({}, comp,
            {
              BATCHQTY: uploadBatch.REMAINQUANTITY,
              INPUTBATCH: uploadBatch.BATCHNAME,
              INPUTBATCHID: uploadBatch.ID
            });
        } else {
          throw Error(`批次${this.loadBatch.batchName}不可用于此工单！`);
        }

        if (comp.INPUTBATCH && comp.INPUTBATCH !== '') {
          return this._bapiService.logoffBatch(this.machineInfo.currentOperation, this.machineInfo.machine, this.loadBatch.operator,
            comp.INPUTBATCHID, 0).pipe(
              tap(logOffResult => {
                if (!logOffResult.isSuccess) {
                  this._tipService['warn'](logOffResult.description);
                  throw Error(logOffResult.description);
                }
              })
            );
        } else {
          return of({
            isSuccess: true,
            error: '',
            description: ''
          });
        }
      }),
      switchMap(ret => {
        return this._bapiService.logonBatch(this.machineInfo.currentOperation, this.machineInfo.machine,
          this.loadBatch.operator, uploadBatch.ID, uploadBatch.MATERIALNUMBER);
      }),
      tap(ret => {
        if (!ret.isSuccess) {
          this._tipService['warn'](ret.description);
          throw Error(ret.description);
        }
      })
    ).subscribe(ret => {
      const comp = this.componentsInfo.find(c => c.MATERIAL === found.MATERIAL);
      comp.INPUTBATCH = found.INPUTBATCH;
      comp.INPUTBATCHID = found.INPUTBATCHID;
      comp.BATCHQTY = found.BATCHQTY;

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

        return this._fetchService.getComponentOfOperation(this.machineInfo.currentOperation, this.machineInfo.machine);
      })
    ).subscribe((ret) => {
      this._toastService.hide();
      this.componentsInfo = ret;

      this.batchElem.nativeElement.focus();
    }, (error) => {
      this._toastService.hide();
      this.resetForm();
      this.machineElem.nativeElement.focus();
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
    return this.machineInfo.currentOperation === null || !this.form.valid;
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
