import { ViewChild, ElementRef } from '@angular/core';
import { MaskComponent, ToastService, ToptipsService } from 'ngx-weui';
import { NgForm } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { filter, tap, delay } from 'rxjs/operators';
import { TitleService } from '@core/title.service';
import { Observable, throwError } from 'rxjs';
import { IBapiResult } from '@core/hydra/bapi/constants';

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

  constructor(protected _toastService: ToastService, protected _routeService: Router,
    protected _tipService: ToptipsService,
    protected _titleService: TitleService) {
    this._routeService.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(event => {
        this._titleService.setTitle(this.title);
      });
  }

  //#endregion

  //#region Abstrace methods

  protected abstract resetForm();
  protected abstract isValid();

  //#endregion

  //#region Protected methods
  protected stopEvent(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }

  protected start() {
    this.isInputing = true;
    this.mask.show();
    this._toastService.loading();
  }

  protected end(err: any = null) {
    if (err) {
      this._tipService.warn(err);
    }
    this.isInputing = false;
    setTimeout(_ => this.mask.hide());
    this._toastService.hide();
  }

  protected request(handler: () => Observable<any>, success: (ret: any) => void, failed: (err: any) => void) {
    return () => {
      this.start();

      handler().subscribe((ret) => {
        success(ret);
        this.end();
      },
        (err) => {
          failed(err);
          this.end(err);
        });
    };
  }

  protected doAction(handler: () => Observable<IBapiResult>, success: (ret: any) => void, failed: (err: any) => void) {
    if (this.isInputing) {
      return;
    }

    this.start();

    handler().pipe(
      tap((ret: IBapiResult) => {
        if (!ret.isSuccess) {
          throwError(ret.description);
        }
      }
      )).subscribe((ret) => {
        success(ret);
        this.end();
        this.resetForm();
      }, (err) => {
        failed(err);
        this.end();
      });
  }

  protected isDisable() {
    return !this.form.valid || this.isInputing || !this.isValid();
  }

  //#endregion

}
