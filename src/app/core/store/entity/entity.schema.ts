import { schema } from 'normalizr';

import { STORE_ENTITIES_KEY } from '@core/store/entity/entity.model';

export const userSchema = new schema.Entity(STORE_ENTITIES_KEY.users);
