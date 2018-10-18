import { Component, ViewChild, ElementRef } from '@angular/core';
import { BapiService } from '@core/hydra/bapi/bapi.service';
import { Router } from '@angular/router';
import { TitleService } from '@core/title.service';
import { ToastService, ToptipsService } from 'ngx-weui';
import { switchMap, map, tap, concatMap } from 'rxjs/operators';
import { throwError, of } from 'rxjs';
import { BatchInfo, OperatorInfo, MachineInfo, ComponentInfo } from '@core/interface/common.interface';
import { NewFetchService } from '@core/hydra/fetch.new.service';
import { BaseForm } from '../base.form';

interface IInputData {
  machineName: string;
  badge: string;
}

class InputData implements IInputData {
  machineName = '';
  badge = '';
}

@Component({
  selector: 'operator-logoff',
  templateUrl: 'logoff-operator.component.html',
  styleUrls: ['./logoff-operator.component.scss']
})
export class LogoffOperatorComponent extends BaseForm {
  //#region View Children

  @ViewChild('machine') machineElem: ElementRef;
  @ViewChild('operator') operatorElem: ElementRef;

  //#endregion

  //#region Protected member

  protected operatorInfo: OperatorInfo = new OperatorInfo();
  protected machineInfo: MachineInfo = new MachineInfo();
  protected operatorList: OperatorInfo[] = [];

  protected inputData: InputData = new InputData();

  protected title = `Operator Logoff`;

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

  requestMachineDataSuccess = (_) => {
  }

  requestMachineDataFailed = () => {
    this.machineElem.nativeElement.select();
    this.resetForm();
  }

  requestMachineData = () => {
    if (this.inputData.machineName === this.machineInfo.machine) {
      return of(null);
    }

    return this._fetchService.getMachineWithOperation(this.inputData.machineName).pipe(
      switchMap((machineInfo) => {
        this.machineInfo = machineInfo;
        return this._fetchService.getOperatorsLoggedOn(this.machineInfo.machine);
      }),
      map(operatorList => {
        this.operatorList = operatorList;
      })
    );
  }

  //#endregion

  //#region Operator Reqeust

  requestOperatorDataSuccess = () => {
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

    return this._fetchService.getOperatorByBadge(this.inputData.badge).pipe(
      tap(operatorInfo => {
        if (!this.operatorList.some(o => o.badge === operatorInfo.badge)) {
          throw Error(`Operator ${operatorInfo.display()} not logged on yet!`);
        }
      }),
      map(operatorInfo => {
        this.operatorInfo = operatorInfo;
        this.operatorInfo['isRemove'] = true;
        const index = this.operatorList.findIndex(o => o.badge === operatorInfo.badge);
        this.operatorList.splice(index, 1, this.operatorInfo);
        this.operatorList = this.operatorList.sort((a, b) => a['isRemove'] ? 0 : 1);
        this.inputData.badge = '';
        this.operatorElem.nativeElement.focus();
      })
    );
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

  logoffOperatorSuccess = () => {
    this._tipService['primary'](`Operators Logged Off!`);
    this.operatorList = this.operatorList.filter(o => !o['isRemove']);
    this.inputData.badge = '';
    this.operatorElem.nativeElement.focus();
  }

  logoffOperatorFailed = () => {
    this.resetForm();
    this.machineElem.nativeElement.focus();
  }

  logoffOperator = () => {
    // Logon Operator
    let obs = of(null);
    this.operatorList.forEach(op => {
      if (op['isRemove']) {
        obs = obs.pipe(
          concatMap(_ => {
            return this._bapiService.logoffUser(this.machineInfo.machine, op.badge);
          })
        );
      }
    });

    return obs;
  }

  //#endregion

  //#region Override methods

  resetForm() {
    this.form.reset();
    this.machineInfo = new MachineInfo();
    this.operatorInfo = new OperatorInfo();

    this.operatorList = [];

    this.machineElem.nativeElement.focus();
  }

  isValid() {
    // return true;
    return this.machineInfo.currentOperation && this.machineInfo.machine
      && this.hasOpeatorToLogoff();
  }

  //#endregion

  //#region Support methods
  hasOpeatorToLogoff() {
    return this.operatorList.some(c => c['isRemove']);
  }

  getStyle(op) {
    return {
      'background-color': !!op['isRemove'] ? 'pink' : 'white'
    };
  }

  //#endregion
}
