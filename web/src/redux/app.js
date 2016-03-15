import user from './reducers/userReducer.js';
import disk from './reducers/diskReducer.js';
import {
  combineReducers
}
from 'redux';

const app = combineReducers({
  user: user,
  disk: disk
});

export default app;
