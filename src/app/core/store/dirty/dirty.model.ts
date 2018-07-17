export enum STORE_DIRTIES_ENTITY_KEY {
  travelAgendas = 'travelAgendas',
}

export enum STORE_DIRTIES_KEY {
  lastSynced = 'lastSynced',
  syncing = 'syncing',
  dirtyIds = 'dirtyIds'
}

export const INIT_DIRTY_STATE: IDirties = {
  lastSynced: null,
  syncing: false,
  dirtyIds: {
    travelAgendas: {
      created: [],
      updated: [],
      deleted: []
    }
  }
};

export interface IDirties {
  lastSynced: Date;
  syncing: boolean;
  dirtyIds: {
    travelAgendas: { created: string[], updated: string[], deleted: string[] }
  };
}
