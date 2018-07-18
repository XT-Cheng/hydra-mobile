import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthResult } from '@core/auth/providers/authResult';
import { AuthService } from '@core/auth/providers/authService';
import { REDIRECT_DELAY } from '@core/constants';

@Component({
  selector: 'auth-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less']
})
export class UserLoginComponent {
  data: any = {
    badge: ''
  };

  constructor(protected service: AuthService, private router: Router) {
  }

  onLogin() {
    this.service.authenticate({ badge: this.data.badge }).subscribe((result: AuthResult) => {
      const redirect = result.getRedirect();
      if (redirect) {
        setTimeout(() => {
          return this.router.navigateByUrl(redirect);
        }, REDIRECT_DELAY);
      }
    });
    // setTimeout(() => {
    //   this.loading = false;
    //   if (this.type === 0) {
    //     if (
    //       this.userName.value !== 'admin' ||
    //       this.password.value !== '888888'
    //     ) {
    //       this.error = `账户或密码错误`;
    //       return;
    //     }
    //   }

    //   // 清空路由复用信息
    //   this.reuseTabService.clear();
    //   // 设置Token信息
    //   this.tokenService.set({
    //     token: '123456789',
    //     name: this.userName.value,
    //     email: `cipchk@qq.com`,
    //     id: 10000,
    //     time: +new Date(),
    //   });
    //   // 重新获取 StartupService 内容，若其包括 User 有关的信息的话
    //   // this.startupSrv.load().then(() => this.router.navigate(['/']));
    //   // 否则直接跳转
    //   this.router.navigate(['/']);
    // }, 1000);
  }
}
