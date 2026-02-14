import { createStore, applyMiddleware, combineReducers } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { all } from 'redux-saga/effects';

// Reducers
import authReducer from './slices/authSlice';
import testReducer from './slices/testSlice';
import loggingReducer from './slices/loggingSlice';

// Sagas
import authSaga from './sagas/authSaga';
import testSaga from './sagas/testSaga';
import loggingSaga from './sagas/loggingSaga';

// Root reducer
const rootReducer = combineReducers({
  auth: authReducer,
  test: testReducer,
  logging: loggingReducer
});

// Root saga
function* rootSaga() {
  yield all([
    authSaga(),
    testSaga(),
    loggingSaga()
  ]);
}

// Create saga middleware
const sagaMiddleware = createSagaMiddleware();

// Create store
const store = createStore(
  rootReducer,
  applyMiddleware(sagaMiddleware)
);

// Run saga
sagaMiddleware.run(rootSaga);

export default store;
