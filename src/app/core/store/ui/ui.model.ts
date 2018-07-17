import { INIT_UI_USER_STATE, IUserUI } from '@core/store/ui/model/user.model';

export enum STORE_UI_KEY {
  city = 'city',
  viewPoint = 'viewPoint',
  user = 'user',
  travelAgenda = 'travelAgenda'
}

export enum STORE_UI_COMMON_KEY {
  selectedId = 'selectedId',
  searchKey = 'searchKey',
  filterIds = 'filterIds'
}

export const INIT_UI_STATE: IUIState = {
  user: INIT_UI_USER_STATE,
};

export interface IUIState {
  user: IUserUI;
}

export interface ICommonUI {
  selectedId: string;
  searchKey: string;
  filterIds: string[];
}
