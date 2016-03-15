import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';

import {
  createStore,
  applyMiddleware
}

from 'redux';
import immutable from 'immutable';
import app from './app';


const loggerMiddleware = createLogger();

const createStoreWithMiddleware = applyMiddleware(
  thunkMiddleware, // lets us dispatch() functions
  loggerMiddleware // neat middleware that logs actions
)(createStore);

//initialState here represent real data it could be from the server;
// var initialState = {
//   presentations: immutable.fromJS({
//     isFetching: false,
//     receivedAt: null,
//     presentations: immutable.Map({}),
//     activePresentation:immutable.Map({})
//   }),
//
//   slides: immutable.Map({
//     isFetching: false,
//     isAdding: false,
//     modalIsOpen: false,
//     insertPosition: {
//       type: 'main',
//       position: 0
//     },
//     slides: immutable.Map({}),
//     sections: immutable.List([]),
//     activeSlide: immutable.Map({}),
//     receivedAt: null
//   })
// };

const store = createStoreWithMiddleware(app);
// const store = createStoreWithMiddleware(wecourseApp, initialState);

export default store;
