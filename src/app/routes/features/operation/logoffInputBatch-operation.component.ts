import { Component, ViewChild, ElementRef } from '@angular/core';
import { BapiService } from '@core/hydra/bapi/bapi.service';
import { FetchService } from '@core/hydra/fetch.service';
import { Router, NavigationEnd } from '@angular/router';
import { TitleService } from '@core/title.service';
import { ToastService, ToptipsService, DialogService, DialogConfig, PopupComponent } from 'ngx-weui';
import { filter, switchMap, map, tap } from 'rxjs/operators';
import { of, throwError } from 'rxjs';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'operation-logoff-input-batch',
  templateUrl: 'logoffInputBatch-operation.component.html',
  styleUrls: ['./logoffInputBatch-operation.component.scss']
})
export class LogoffInputBatchComponent {
  @ViewChild('f') form: NgForm;
  @ViewChild('machine') machineElem: ElementRef;
  @ViewChild('batch') batchElem: ElementRef;
  @ViewChild('operator') operatorElem: ElementRef;
  @ViewChild('currentOperation') currentOperationElem: ElementRef;

  machineInfo: any = {
    machine: '',
    currentOPDescription: '',
    nextOPDescription: '',
    currentOperation: '',
    nextOperation: ''
  };

  unloadBatch: any = {
    batchName: '',
    operator: ''
  };

  toBeUnLoadedBatch: any = {
    materialNumber: '',
    batchName: '',
    quantity: '',
    description: '',
  };

  componentsInfo: Array<any> = [];
  operatorInfo: any;

  constructor(private _bapiService: BapiService, private _fetchService: FetchService,
    private _routeService: Router, private _titleService: TitleService,
    private _tipService: ToptipsService, private _toastService: ToastService) {
    this._routeService.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    ).subscribe(() => {
      this._titleService.setTitle(`Logoff Mat.`);
    });
  }

  BatchEntered(event) {
    event.preventDefault();

    if (this.machineInfo.machine === '') {
      return;
    }

    if (this.unloadBatch.batchName === '') {
      return;
    }

    let found: any;
    let unloadBatch: any;

    this._fetchService.getBatchInformation(this.unloadBatch.batchName).pipe(
      map(ret => {
        if (ret === null || ret.length === 0) {
          throw Error(`Batch ${this.unloadBatch.batchName} not exist!`);
        }

        unloadBatch = ret[0];

        const comp = this.componentsInfo.find(c => c.INPUTBATCH === unloadBatch.BATCHNAME);

        if (comp) {
          found = Object.assign({}, comp,
            {
              BATCHQTY: unloadBatch.REMAINQUANTITY,
              INPUTBATCH: unloadBatch.BATCHNAME,
              INPUTBATCHID: unloadBatch.ID
            });
        } else {
          throw Error(`Batch ${this.unloadBatch.batchName} not in the machine ！`);
        }
      })
    ).subscribe(_ => {
      this.toBeUnLoadedBatch.quantity = found.BATCHQTY;
      this.toBeUnLoadedBatch.batchName = found.INPUTBATCH;
      this.toBeUnLoadedBatch.materialNumber = found.MATERIAL;
      this.toBeUnLoadedBatch.description = `Batch: ${this.toBeUnLoadedBatch.batchName}, ` +
        `Material: ${this.toBeUnLoadedBatch.materialNumber}, Qty: ${this.toBeUnLoadedBatch.quantity}`;

      this.unloadBatch = {};

      this._toastService.hide();

      this.operatorElem.nativeElement.focus();
    }, error => {
      this._tipService['warn'](error);

      this.unloadBatch = {};
      this._toastService.hide();

      this.batchElem.nativeElement.focus();
    });
  }

  OperatorEntered(event) {
    event.preventDefault();

    if (this.machineInfo.machine === '') {
      return;
    }

    if (this.unloadBatch.operator === '') {
      return;
    }

    this._toastService['loading']();

    this._fetchService.getOperator(this.unloadBatch.operator).subscribe(ret => {
      this._toastService.hide();
      if (ret === null || ret.length === 0) {
        this._tipService['warn'](`Operator ${this.unloadBatch.operator} not exist！`);
        this.resetForm();
      } else {
        this.operatorInfo = `Operator ${ret[0].NAME}`;
        // this.ChangeInputBatch();
      }
    }, err => {
      this._toastService.hide();
      this._tipService['warn'](`Error: ${err}！`);
      this.resetForm();
    });
  }

  LogoffInputBatch() {
    let unloadBatch: any;
    this._toastService['loading']();

    this._fetchService.getBatchInformation(this.toBeUnLoadedBatch.batchName).pipe(
      switchMap(ret => {
        if (ret === null || ret.length === 0) {
          return throwError(`Batch ${this.toBeUnLoadedBatch.batchName} not exist！`);
        }

        unloadBatch = ret[0];

        const comp = this.componentsInfo.find(c => c.INPUTBATCH === unloadBatch.BATCHNAME);

        if (!comp) {
          return throwError(`Batch ${this.toBeUnLoadedBatch.batchName} not in the machine ！`);
        }

        return this._bapiService.logoffBatch(this.machineInfo.currentOperation, this.machineInfo.machine, this.unloadBatch.operator,
          comp.INPUTBATCHID, 0).pipe(
            tap(logOffResult => {
              if (!logOffResult.isSuccess) {
                return throwError(logOffResult.description);
              }
            })
          );
      }),
      tap(ret => {
        if (!ret.isSuccess) {
          return throwError(ret.description);
        }
      })
    ).subscribe(ret => {
      const comp = this.componentsInfo.find(c => c.INPUTBATCH === unloadBatch.BATCHNAME);
      comp.INPUTBATCH = comp.INPUTBATCHID = '';
      comp.BATCHQTY = '';

      this._toastService.hide();
      this.unloadBatch = {};
      this.batchElem.nativeElement.focus();
    }, error => {
      this._tipService['warn'](error);

      this.toBeUnLoadedBatch = this.unloadBatch = {};
      this.operatorInfo = '';
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
          return throwError(`Machine ${this.machineInfo.machine} not exist!`);
        } else if (!ret.CURRENTOPERATION) {
          return throwError(`Machine ${this.machineInfo.machine} has no OP logged on!`);
        } else {
          this.machineInfo.machine = ret.MACHINE;
          this.machineInfo.currentOperation = ret.CURRENTOPERATION;
          this.machineInfo.nextOperation = ret.NEXTOPERATION;
          this.machineInfo.currentOPDescription = `Current OP: ${ret.CURRENTOPERATION === null ?
            `N/A` : ret.CURRENTMOTHEROPERTAION + ` / ` + ret.CURRENTOPERATION}`;
          this.machineInfo.nextOPDescription = `Next OP: ${ret.NEXTOPERATION === null ?
            `N/A` : ret.NEXTMOTHEROPERATION + ` / ` + ret.NEXTOPERATION}`;
        }

        return this._fetchService.getComponentOfOperation(this.machineInfo.currentOperation, this.machineInfo.machine);
      })
    ).subscribe((ret) => {
      ret = ret.sort((a, b) => {
        return (a.BATCHQTY - b.BATCHQTY);
      });
      this._toastService.hide();
      this.componentsInfo = ret;

      this.batchElem.nativeElement.focus();
    }, (error) => {
      this._toastService.hide();
      this._tipService['warn'](error);
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
    this.machineInfo = this.unloadBatch = this.toBeUnLoadedBatch = {};
    this.operatorInfo = '';
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
          this.unloadBatch = {};
          this.batchElem.nativeElement.focus();
        } else {
          comp.INPUTBATCH = '';
          comp.INPUTBATCHID = '';
          comp.BATCHQTY = '';
        }
        this._toastService.hide();
      });
  }

  compDescription(comp) {
    if (comp.INPUTBATCH === ``) {
      return ``;
    } else {
      return `Batch:${comp.INPUTBATCH},Qty: ${comp.BATCHQTY}`;
    }
  }
}
