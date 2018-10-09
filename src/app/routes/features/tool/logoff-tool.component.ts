import { Component, ViewChild, ElementRef } from '@angular/core';
import { BapiService } from '@core/hydra/bapi/bapi.service';
import { Router } from '@angular/router';
import { TitleService } from '@core/title.service';
import { ToastService, ToptipsService } from 'ngx-weui';
import { switchMap, map, tap } from 'rxjs/operators';
import { throwError, of } from 'rxjs';
import { BatchInfo, OperatorInfo, MachineInfo, ComponentInfo, ToolInfo, ResourceInfo } from '@core/interface/common.interface';
import { NewFetchService } from '@core/hydra/fetch.new.service';
import { BaseForm } from '../base.form';

interface InputData {
  machineName: string;
  tool: string;
  badge: string;
}

class InputData implements InputData {
  machineName = '';
  tool = '';
  badge = '';
}

@Component({
  selector: 'tool-logoff',
  templateUrl: 'logoff-tool.component.html',
  styleUrls: ['./logoff-tool.component.scss']
})
export class LogoffToolComponent extends BaseForm {
  //#region View Children

  @ViewChild('machine') machineElem: ElementRef;
  @ViewChild('tool') toolElem: ElementRef;
  @ViewChild('operator') operatorElem: ElementRef;

  //#endregion

  //#region Protected member

  protected toolInfo: ResourceInfo = new ResourceInfo();
  protected operatorInfo: OperatorInfo = new OperatorInfo();
  protected machineInfo: MachineInfo = new MachineInfo();
  protected toolList: ToolInfo[] = [];

  protected inputData: InputData = new InputData();

  protected title = `Tool Logoff`;

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
        return this._fetchService.getToolOfOperation(this.machineInfo.nextOperation, this.machineInfo.machine);
      }),
      map(toolList => {
        this.toolList = toolList;
      })
    );
  }

  //#endregion

  //#region Batch Request

  requestToolDataSuccess = (_) => {
  }

  requestToolDataFailed = () => {
    this.inputData.tool = '';
    this.toolInfo = new ResourceInfo();
    this.toolElem.nativeElement.focus();
  }

  requestToolData = () => {
    if (!this.inputData.tool) {
      return of(null);
    }

    if (this.inputData.tool === this.toolInfo.tool) {
      return of(null);
    }

    return this._fetchService.getResourceInformation(this.inputData.tool).pipe(
      map(toolInfo => {
        this.toolInfo = toolInfo;
        const found = this.toolList.some(c => {
          return this.toolInfo.tool === c.inputTool;
        });
        if (!found) {
          return throwError(`Tool ${this.toolInfo.tool} not logged on yet!`);
        }
      }));
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
      map(operatorInfo => {
        this.operatorInfo = operatorInfo;
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

    this.toolElem.nativeElement.focus();
  }

  toolEntered(event) {
    this.stopEvent(event);

    if (this.form.controls['tool'].invalid) {
      this.toolElem.nativeElement.select();
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

  logoffToolSuccess = () => {
    this._tipService['primary'](`Tool ${this.toolInfo.tool} Logged Off!`);
    this.inputData.tool = '';
    this.toolInfo = new ResourceInfo();
    this.toolElem.nativeElement.focus();
  }

  logoffToolFailed = () => {
    this.machineElem.nativeElement.focus();
  }

  logoffTool = () => {
    // Logoff Tool
    return this._bapiService.logoffTool(this.machineInfo.nextOperation, this.machineInfo.machine,
      this.toolInfo.toolId, this.operatorInfo.badge).pipe(
        tap(_ => {
          this.toolList = this.toolList.filter(c => {
            return c.inputTool !== this.toolInfo.tool;
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
    this.toolInfo = new ResourceInfo();

    this.toolList = [];

    this.machineElem.nativeElement.focus();
  }

  isValid() {
    return this.toolInfo.tool && this.machineInfo.machine
      && this.operatorInfo.badge;
  }

  //#endregion

  //#region Support methods

  getResultClass(tool) {
    return {
      'weui-icon-success': !!tool.inputTool,
      'weui-icon-warn': !tool.inputTool
    };
  }

  //#endregion
}
