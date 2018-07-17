import { IBiz } from '@core/store/bizModel/biz.model';

export interface IUserBiz extends IBiz {
  name: string;
  nick: string;
  picture: string;
}
