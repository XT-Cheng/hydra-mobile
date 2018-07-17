import { IEntity } from '@core/store/entity/entity.model';

export interface IUser extends IEntity {
  name: string;
  nick: string;
  picture: string;
}
