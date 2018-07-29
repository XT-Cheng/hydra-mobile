import { Component, ViewChild, ElementRef } from '@angular/core';
import { BapiService } from '@core/hydra/bapi/bapi.service';
import { FetchService } from '@core/hydra/fetch.service';
import { Router, NavigationEnd } from '@angular/router';
import { TitleService } from '@core/title.service';
import { ToastService, ToptipsService, DialogService, DialogConfig, PopupComponent } from 'ngx-weui';
import { filter, switchMap, map, tap } from 'rxjs/operators';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'operation-logoff',
  templateUrl: 'logoff-operation.component.html',
  styleUrls: ['./logoff-operation.component.scss']
})
export class LogoffOperationComponent {
  @ViewChild('f') form: NgForm;
  @ViewChild('machine') machineElem: ElementRef;
  @ViewChild('operator') operatorElem: ElementRef;

  machineInfo: any = {
    machine: '',
    description: '',
    currentOperation: '',
    nextOperation: ''
  };

  data: any = {
    operator: ''
  };

  constructor(private _bapiService: BapiService, private _fetchService: FetchService,
    private _routeService: Router, private _titleService: TitleService,
    private _tipService: ToptipsService, private _toastService: ToastService) {
    this._routeService.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    ).subscribe(() => {
      this._titleService.setTitle(`工单结束`);
    });
  }

  OperatorEntered(event) {
    event.preventDefault();

    if (this.machineInfo.machine === '') {
      return;
    }

    this.logoffOperation();
  }

  MachineEntered(event) {
    event.preventDefault();

    if (this.machineInfo.machine === '') {
      return;
    }

    this._toastService['loading']();

    this._fetchService.getMachineWithOperation(this.machineInfo.machine).pipe(
      tap((ret) => {
        if (!ret.MACHINE) {
          this._tipService['warn'](`设备${this.machineInfo.machine}不存在！`);
          throw Error(`设备${this.machineInfo.machine}不存在！`);
        }
      })
    ).subscribe((ret) => {
      this._toastService.hide();

      this.machineInfo.machine = ret.MACHINE;
      this.machineInfo.currentOperation = ret.CURRENTOPERATION;
      this.machineInfo.nextOperation = ret.NEXTOPERATION;
      this.machineInfo.description = `当前工单:${this.machineInfo.currentOperation === null ? '空' : this.machineInfo.currentOperation}`;

      this.operatorElem.nativeElement.focus();
    }, (error) => {
      this._tipService.warn(error);

      this._toastService.hide();
      this.resetForm();
      this.machineElem.nativeElement.focus();
    });
  }

  logoffOperation() {
    this._toastService['loading']();
    this._bapiService.logoffOperation(this.machineInfo.currentOperation, this.machineInfo.machine,
      this.data.operator).pipe(
        tap((ret) => {
          if (!ret.isSuccess) {
            throw Error(ret.description);
          }
        })
      )
      .subscribe(ret => {
        this._tipService['primary'](`工单${this.machineInfo.currentOperation}结束成功！`);
        this._toastService.hide();
        this.resetForm();
      }, error => {
        this._tipService.warn(error);
        this._toastService.hide();
        this.resetForm();
      });
  }

  resetForm() {
    this.form.reset();
    this.machineInfo = {};
    this.data = {};
    this.machineElem.nativeElement.focus();
  }

  isDisable() {
    return this.machineInfo.currentOperation === null || !this.form.valid;
  }
}
