import { Component, ViewChild, ElementRef } from '@angular/core';
import { BapiService } from '@core/hydra/bapi/bapi.service';
import { FetchService } from '@core/hydra/fetch.service';
import { Router, NavigationEnd } from '@angular/router';
import { TitleService } from '@core/title.service';
import { ToastService, ToptipsService, DialogService, DialogConfig, PopupComponent } from 'ngx-weui';
import { filter, switchMap, map, tap } from 'rxjs/operators';
import { NgForm } from '@angular/forms';
import { throwError, of } from 'rxjs';
import { BatchInfo, OperatorInfo, MachineInfo, ComponentInfo } from '@core/interface/common.interface';
import { NewFetchService } from '@core/hydra/fetch.new.service';
import { BaseForm } from '../base.form';

interface InputData {
  machineName: string;
  barCode: string;
  batchName: string;
  badge: string;
}

class InputData implements InputData {
  machineName = '';
  barCode = '';
  badge = '';
  batchName = '';
}

@Component({
  selector: 'batch-logoff',
  templateUrl: 'logoff-batch.component.html',
  styleUrls: ['./logoff-batch.component.scss']
})
export class LogoffBatchComponent extends BaseForm {
  //#region View Children

  @ViewChild('machine') machineElem: ElementRef;
  @ViewChild('batch') batchElem: ElementRef;
  @ViewChild('operator') operatorElem: ElementRef;

  //#endregion

  //#region Protected member

  protected batchInfo: BatchInfo = new BatchInfo();
  protected operatorInfo: OperatorInfo = new OperatorInfo();
  protected machineInfo: MachineInfo = new MachineInfo();
  protected componenstList: ComponentInfo[] = [];

  protected inputData: InputData = new InputData();

  protected title = `Batch Logoff`;

  //#endregion

  //#region Constructor

  constructor(
    private _fetchService: NewFetchService,
    private _bapiService: BapiService,
    _routeService: Router,
    _titleService: TitleService,
    _toastService: ToastService,
    _tipService: ToptipsService
  ) {
    super(_toastService, _routeService, _tipService, _titleService, false);
  }

  //#endregion

  //#region Data Request

  //#region Machine Reqeust

  requestMachineDataSuccess = (ret) => {
    this.machineInfo = ret.machine;
    this.componenstList = ret.components;
  }

  requestMachineDataFailed = () => {
    this.machineElem.nativeElement.select();
    this.resetForm();
  }

  requestMachineData = () => {
    if (!this.inputData.machineName) {
      this.machineInfo = new MachineInfo();
      return of(this.machineInfo);
    }

    if (this.inputData.machineName === this.machineInfo.machine) {
      return of({ machine: this.machineInfo, components: this.componenstList });
    }

    return this._fetchService.getMachineWithOperation(this.inputData.machineName).pipe(
      switchMap((machineInfo) => {
        if (machineInfo.currentOperation) {
          return throwError(`Machine ${this.inputData.machineName} has OP ${machineInfo.currentOperation} running!`);
        }
        this.machineInfo = machineInfo;
        return this._fetchService.getComponentOfOperation(this.machineInfo.nextOperation, this.machineInfo.machine);
      }),
      map(componentList => {
        return { machine: this.machineInfo, components: componentList };
      })
    );
  }

  //#endregion

  //#region Batch Request

  requestBatchDataSuccess = (ret) => {
    this.batchInfo = ret;
    this.inputData.barCode = this.batchInfo.batchName;
  }

  requestBatchDataFailed = () => {
    this.inputData.barCode = this.inputData.batchName = '';
    this.batchInfo = new BatchInfo();
    this.batchElem.nativeElement.focus();
  }

  requestBatchData = () => {
    if (!this.inputData.barCode) {
      this.batchInfo = new BatchInfo();
      return of(this.batchInfo);
    }

    if (this.inputData.barCode === this.batchInfo.barCode) {
      return of(this.batchInfo);
    }

    return this._fetchService.getBatchInfoFrom2DBarCode(this.inputData.barCode).pipe(
      switchMap((batchInfo: BatchInfo) => {
        this.batchInfo = batchInfo;
        return this._fetchService.getBatchInformation(batchInfo.batchName);
      }),
      switchMap(batchInfo => {
        const found = this.componenstList.some(c => {
          return c.material === batchInfo.material && c.inputBatch === batchInfo.batchName;
        });
        if (!found) {
          return throwError(`Batch ${this.batchInfo.batchName} not logged on yet!`);
        }

        return of(batchInfo);
      }));
  }

  //#endregion

  //#region Operator Reqeust

  requestOperatorDataSuccess = (operatorInfo) => {
    this.operatorInfo = operatorInfo;
  }

  requestOperatorDataFailed = () => {
    this.operatorInfo = new OperatorInfo();
    this.operatorElem.nativeElement.select();
  }

  requestOperatorData = () => {
    if (!this.inputData.badge) {
      this.operatorInfo = new OperatorInfo();
      return of(this.operatorInfo);
    }

    if (this.inputData.badge === this.operatorInfo.badge) {
      return of(this.operatorInfo);
    }

    return this._fetchService.getOperatorByBadge(this.inputData.badge);
  }
  //#endregion

  //#endregion

  //#region Event Handler

  machineEntered(event) {
    this.stopEvent(event);

    if (this.form.controls['machine'].invalid) {
      this.machineElem.nativeElement.select();
      return;
    }

    this.batchElem.nativeElement.focus();
  }

  batchEntered(event) {
    this.stopEvent(event);

    if (this.form.controls['batch'].invalid) {
      this.batchElem.nativeElement.select();
      return;
    }

    this.operatorElem.nativeElement.focus();
  }

  operatorEntered(event) {
    this.stopEvent(event);

    if (this.form.controls['operator'].invalid) {
      this.operatorElem.nativeElement.select();
      return;
    }

    this.operatorElem.nativeElement.blur();
  }

  //#endregion

  //#region Exeuction

  logoffBatchSuccess = () => {
    this._tipService['primary'](`Batch ${this.batchInfo.batchName} Logged Off!`);
    this.inputData.batchName = '';
    this.inputData.barCode = '';
    this.batchElem.nativeElement.focus();
  }

  logoffBatchFailed = () => {
    this.machineElem.nativeElement.focus();
  }

  logoffBatch = () => {
    // Logoff Batch
    const comp = this.componenstList.find(c => c.material === this.batchInfo.material && c.inputBatch === this.batchInfo.batchName);

    return this._bapiService.logoffBatch(this.machineInfo.nextOperation, this.machineInfo.machine, this.operatorInfo.badge,
      this.batchInfo.batchName, comp.position).pipe(
        tap(_ => {
          this.componenstList = this.componenstList.map(c => {
            if (c.material === comp.material && c.position === comp.position) {
              return Object.assign(c, { inputBatch: '', inputBatchQty: 0 });
            }
            return c;
          });
        })
      );
  }

  //#endregion

  //#region Override methods

  resetForm() {
    this.form.reset();
    this.machineInfo = new MachineInfo();
    this.operatorInfo = new OperatorInfo();
    this.batchInfo = new BatchInfo();

    this.componenstList = [];

    this.machineElem.nativeElement.focus();
  }

  isValid() {
    return this.batchInfo.batchName && this.machineInfo.machine
      && this.operatorInfo.badge;
  }

  //#endregion

  getResultClass(comp) {
    return {
      'weui-icon-success': this.showSuccess(comp),
      'weui-icon-warn': this.showError(comp)
    };
  }

  showSuccess(comp): boolean {
    return !!comp.inputBatch;
  }

  showError(comp): boolean {
    return !comp.inputBatch;
  }


  isMissComponent() {
    // let isMissing = false;
    // this.componenstList.forEach(c => {
    //   if (c.INPUTBATCH === '' && this.toBeLoadedBatch.materialNumber !== c.MATERIAL) {
    //     isMissing = true;
    //     return;
    //   }
    // });

    // return isMissing;
  }

  // logoffBatch(comp) {
  // this._toastService['loading']();
  // this._bapiService.logoffBatch(this.machineInfo.nextOperation, this.machineInfo.machine, '20120821',
  //   comp.INPUTBATCHID, 0).subscribe(ret => {
  //     if (!ret.isSuccess) {
  //       this._tipService['warn'](ret.description);
  //       this.loadBatch = {};
  //       this.batchElem.nativeElement.focus();
  //     } else {
  //       comp.INPUTBATCH = '';
  //       comp.INPUTBATCHID = '';
  //       comp.BATCHQTY = '';
  //     }
  //     this._toastService.hide();
  //   });
  // }

  compDescription(comp: ComponentInfo) {
    if (comp.inputBatch) {
      return `Batch:${comp.inputBatch},Qty:${comp.inputBatchQty}`;
    }

    return ``;
  }

  //#endregion
}
