import {
  SHARED_DATA_STORAGE_KEY,
  loadSharedData,
  persistSharedData,
} from "../data/sharedData";

export const studentDataService = {
  load: loadSharedData,
  save: persistSharedData,
  storageKey: SHARED_DATA_STORAGE_KEY,
};
