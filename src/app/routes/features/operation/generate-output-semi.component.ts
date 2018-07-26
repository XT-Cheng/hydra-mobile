import { Component, ViewChild, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { BapiService } from '@core/hydra/bapi/bapi.service';
import { TitleService } from '@core/title.service';
import { Router, NavigationEnd } from '@angular/router';
import { ToptipsService, ToastService } from 'ngx-weui';
import { filter, switchMap, catchError, tap } from 'rxjs/operators';
import { FetchService } from '@core/hydra/fetch.service';

@Component({
    selector: 'batch-semi-generate',
    templateUrl: 'generate-output-semi.component.html',
    styleUrls: ['./generate-output-semi.component.scss']
})
export class GenerateOutputSemiBatchComponent {
    @ViewChild('f') form: NgForm;
    @ViewChild('machine') machineElem: ElementRef;
    @ViewChild('batchName') batchNameElem: ElementRef;
    @ViewChild('operator') operatorElem: ElementRef;
    @ViewChild('batchQty') batchQtyElem: ElementRef;

    machineInfo: any = {
        machine: '',
        description: '',
        currentOperation: '',
        nextOperation: ''
    };

    outputBatch: any = {
        batchName: '',
        batchQty: '',
        operator: ''
    };

    constructor(private _bapiService: BapiService, private _fetchService: FetchService,
        private _routeService: Router, private _titleService: TitleService,
        private _tipService: ToptipsService, private _toastService: ToastService) {
        this._routeService.events.pipe(
            filter((event) => event instanceof NavigationEnd)
        ).subscribe(() => {
            this._titleService.setTitle(`半成品批次生成`);
        });
    }

    MachineEntered(event) {
        event.preventDefault();

        if (this.machineInfo.machine === '') {
            return;
        }

        this._toastService['loading']();

        this._fetchService.getMachineWithOperation(this.machineInfo.machine).pipe(
            tap(ret => {
                if (!ret.MACHINE) {
                    this._tipService['warn'](`设备${this.machineInfo.machine}不存在！`);
                    throw Error(`设备${this.machineInfo.machine}不存在！`);
                } else {
                    this.machineInfo.machine = ret.MACHINE;
                    this.machineInfo.currentOperation = ret.CURRENTOPERATION;
                    this.machineInfo.nextOperation = ret.NEXTOPERATION;
                    this.machineInfo.description = `当前工单:${this.machineInfo.currentOperation === null ?
                        '空' : this.machineInfo.currentOperation}`;
                }
            })
        ).subscribe((ret) => {
            this._toastService.hide();
            this.batchNameElem.nativeElement.focus();
        }, (error) => {
            this._toastService.hide();
            this.resetForm();
        });
    }

    resetForm() {
        this.form.reset();
        this.machineInfo = {};
        this.machineElem.nativeElement.focus();
    }

    BatchNameEntered() {
        event.preventDefault();

        if (this.machineInfo.machine === '') {
            return;
        }

        if (this.outputBatch.batchName === '') {
            return;
        }

        this.batchQtyElem.nativeElement.focus();
    }

    QuantityEntered() {
        event.preventDefault();

        if (this.machineInfo.machine === '') {
            return;
        }

        if (this.outputBatch.batchName === '') {
            return;
        }

        if (this.outputBatch.batchQty === '') {
            return;
        }

        this.operatorElem.nativeElement.focus();
    }

    OperatorEntered() {
        event.preventDefault();

        if (this.machineInfo.machine === '') {
            return;
        }

        if (this.outputBatch.batchName === '') {
            return;
        }

        if (this.outputBatch.batchQty === '') {
            return;
        }

        if (this.outputBatch.operator === '') {
            return;
        }

        this.generateOutputBatch();
    }

    isDisable() {
        return this.machineInfo.currentOperation === null || !this.form.valid;
    }

    generateOutputBatch() {
        this._toastService['loading']();

        this._fetchService.getActiveOutputBatch(this.machineInfo.currentOperation, this.machineInfo.machine).pipe(
            switchMap(res => {
                if (res === null || res.length === 0) {
                    this._tipService['warn'](`没有可用的批次！`);
                    throw Error(`没有可用的批次！`);
                }

                return this._bapiService.generateOutputSemiBatch(this.machineInfo.currentOperation, this.machineInfo.machine,
                    res[0].ACTIVEBATCHID, this.outputBatch.batchName, this.outputBatch.operator, this.outputBatch.batchQty);
            })
        ).subscribe(ret => {
            this._tipService['primary'](`批次${this.outputBatch.batchName}生成成功！`);
            this._toastService.hide();
            this.resetForm();
        }, err => {
            this._toastService.hide();
            this.resetForm();
        });
    }
}
