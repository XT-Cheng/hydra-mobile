import { Component, ViewChild, ElementRef } from '@angular/core';
import { BapiService } from '@core/hydra/bapi/bapi.service';
import { FetchService } from '@core/hydra/fetch.service';
import { Router, NavigationEnd } from '@angular/router';
import { TitleService } from '@core/title.service';
import { ToastService, ToptipsService, DialogService, DialogConfig } from 'ngx-weui';
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
  @ViewChild('nextOperation') nextOperationElem: ElementRef;

  machineInfo: any = {
    machine: '',
    description: '',
    currentOperation: '',
    nextOperation: ''
  };

  componentsInfo: any = [];

  private DEFCONFIG: DialogConfig = <DialogConfig>{
    title: '弹窗标题',
    content: '弹窗内容，告知当前状态、信息和解决方法，描述文字尽量控制在三行内',
    cancel: '辅助操作',
    confirm: '主操作',
    inputPlaceholder: '必填项',
    inputError: '请填写或选择项',
    inputRequired: true,
    inputAttributes: {
      maxlength: 140,
      cn: 2
    },
    inputOptions: [
      { text: '请选择' },
      { text: '杜蕾斯', value: 'durex', other: 1 },
      { text: '杰士邦', value: 'jissbon' },
      { text: '多乐士', value: 'donless' },
      { text: '处男', value: 'first' }
    ]
  };
  config: DialogConfig = {};

  constructor(private _bapiService: BapiService, private _fetchService: FetchService,
    private _routeService: Router, private _titleService: TitleService,
    private _dialogService: DialogService,
    private _tipService: ToptipsService, private _toastService: ToastService) {
    this._routeService.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    ).subscribe(() => {
      this._titleService.setTitle(`工单登录`);
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
        this._toastService.hide();
        if (!ret) {
          this._tipService['warn'](`设备${this.machineInfo.machine}不存在！`);
          this.resetForm();
        } else {
          this.machineInfo.machine = ret.MACHINE;
          this.machineInfo.currentOperation = ret.CURRENTOPERATION;
          this.machineInfo.nextOperation = ret.NEXTOPERATION;
          this.machineInfo.description = `当前工单:${this.machineInfo.currentOperation === null ? '空' : this.machineInfo.currentOperation}`;
        }

        return this._fetchService.getComponentOfOperation(this.machineInfo.nextOperation);
      })
    ).subscribe((ret) => {
      this.componentsInfo = ret;
    });
  }

  logonOP() {

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

    this.machineElem.nativeElement.focus();
  }

  showLoadComp() {
    const cog = Object.assign({}, this.DEFCONFIG, <DialogConfig>{
      skin: 'auto',
      type: 'prompt',
      confirm: '确认',
      cancel: '取消',
      input: 'text',
      inputValue: undefined,
      inputRegex: null
    });
    setTimeout(() => {
      this._dialogService.show(cog).subscribe((res: any) => {
        console.log(res);
      });
    });

    return false;
  }
}
