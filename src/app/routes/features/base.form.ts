import { ViewChild, ElementRef } from '@angular/core';
import { MaskComponent, ToastService, ToptipsService } from 'ngx-weui';
import { NgForm } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TitleService } from '@core/title.service';
import { Observable } from 'rxjs';

export abstract class BaseForm {
  //#region Abstract property

  protected abstract title: string;

  //#endregion

  //#region View Children

  @ViewChild('f') form: NgForm;
  @ViewChild('execute', { read: ElementRef }) buttonElem: ElementRef;
  @ViewChild('mask') mask: MaskComponent;

  //#endregion

  //#region Protected member

  protected isInputing = false;
  protected Inputing = () => {
    this.isInputing = true;
  }

  //#endregion

  //#region Constructor

  constructor(private _toastService: ToastService, private _routeService: Router,
    private _tipService: ToptipsService,
    private _titleService: TitleService) {
    this._routeService.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(event => {
        this._titleService.setTitle(`Batch Create`);
      });
  }

  //#endregion

  //#region Protected methods

  protected start() {
    this.isInputing = true;
    this.mask.show();
    this._toastService.loading();
  }

  protected end() {
    this.isInputing = false;
    setTimeout(_ => this.mask.hide());
    this._toastService.hide();
  }

  protected request(handler: () => Observable<any>, success: (ret: any) => void) {
    this.start();

    handler().subscribe((ret) => success(ret),
      (err) => this.end());
  }

  //#endregion
}
