import { IUser } from '@core/store/entity/model/user.model';

export enum EntityTypeEnum {
    USER = 'USER',
}

export enum STORE_ENTITIES_KEY {
    users = 'users',
}

export interface IEntity {
    id: string;
}

export interface IEntities {
    users: { [id: string]: IUser };
}

export const INIT_ENTITY_STATE: IEntities = {
    users: {},
};

// {} |
