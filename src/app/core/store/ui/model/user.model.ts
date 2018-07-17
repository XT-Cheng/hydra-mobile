export enum STORE_UI_USER_KEY {
  userLoggedIn = 'userLoggedIn'
}

export const INIT_UI_USER_STATE: IUserUI = {
  userLoggedIn: ''
};

export interface IUserUI {
  userLoggedIn: string;
}
