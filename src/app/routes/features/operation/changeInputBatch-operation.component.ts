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
    currentOPDescription: '',
    nextOPDescription: '',
    currentOperation: '',
    nextOperation: ''
  };

  loadBatch: any = {
    batchName: '',
    operator: ''
  };

  toBeLoadedBatch: any = {
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
      this._titleService.setTitle(`Replenish Mat.`);
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

    let found: any;
    let uploadBatch: any;

    this._fetchService.getBatchInformation(this.loadBatch.batchName).pipe(
      map(ret => {
        if (ret === null || ret.length === 0) {
          throw Error(`Batch ${this.loadBatch.batchName} not exist!`);
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
          throw Error(`Batch ${this.loadBatch.batchName} not allowed ！`);
        }
      })
    ).subscribe(_ => {
      this.toBeLoadedBatch.quantity = found.BATCHQTY;
      this.toBeLoadedBatch.batchName = found.INPUTBATCH;
      this.toBeLoadedBatch.materialNumber = found.MATERIAL;
      this.toBeLoadedBatch.description = `Batch: ${this.toBeLoadedBatch.batchName}, ` +
        `Material: ${this.toBeLoadedBatch.materialNumber}, Qty: ${this.toBeLoadedBatch.quantity}`;

      this.loadBatch = {};

      this._toastService.hide();

      this.operatorElem.nativeElement.focus();
    }, error => {
      this._tipService['warn'](error);

      this.loadBatch = {};
      this._toastService.hide();

      this.batchElem.nativeElement.focus();
    });
  }

  OperatorEntered(event) {
    event.preventDefault();

    if (this.machineInfo.machine === '') {
      return;
    }

    if (this.loadBatch.operator === '') {
      return;
    }

    this._toastService['loading']();

    this._fetchService.getOperator(this.loadBatch.operator).subscribe(ret => {
      this._toastService.hide();
      if (ret === null || ret.length === 0) {
        this._tipService['warn'](`Operator ${this.loadBatch.operator} not exist！`);
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

  ChangeInputBatch() {
    let found: any;
    let uploadBatch: any;
    this._toastService['loading']();

    this._fetchService.getBatchInformation(this.toBeLoadedBatch.batchName).pipe(
      switchMap(ret => {
        if (ret === null || ret.length === 0) {
          return throwError(`Batch ${this.toBeLoadedBatch.batchName} not exist！`);
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
          return throwError(`Batch ${this.toBeLoadedBatch.batchName} is not allowed`);
        }

        if (comp.INPUTBATCH && comp.INPUTBATCH !== '') {
          return this._bapiService.logoffBatch(this.machineInfo.currentOperation, this.machineInfo.machine, this.loadBatch.operator,
            comp.INPUTBATCHID, 0).pipe(
              tap(logOffResult => {
                if (!logOffResult.isSuccess) {
                  return throwError(logOffResult.description);
                }
              })
            );
        } else {
          return of({
            isSuccess: true,
            error: '',
            description: '',
            content: ''
          });
        }
      }),
      switchMap(ret => {
        return this._bapiService.logonBatch(this.machineInfo.currentOperation, this.machineInfo.machine,
          this.loadBatch.operator, uploadBatch.ID, uploadBatch.MATERIALNUMBER, found.POSITION);
      }),
      tap(ret => {
        if (!ret.isSuccess) {
          return throwError(ret.description);
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
      this._tipService['warn'](error);

      this.toBeLoadedBatch = this.loadBatch = {};
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
    this.machineInfo = this.loadBatch = this.toBeLoadedBatch = {};
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
          this.loadBatch = {};
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
