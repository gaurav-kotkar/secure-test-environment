import { call, put, takeLatest } from 'redux-saga/effects';
import { testAPI } from '../../services/api';
import {
  TEST_START_REQUEST,
  TEST_GET_CURRENT_REQUEST,
  TEST_SUBMIT_REQUEST,
  TEST_GET_LOGS_REQUEST,
  startTestSuccess,
  startTestFailure,
  getCurrentTestSuccess,
  getCurrentTestFailure,
  submitTestSuccess,
  submitTestFailure,
  getLogsSuccess,
  getLogsFailure
} from '../slices/testSlice';

// Start test saga
function* startTestSaga() {
  try {
    const response = yield call(testAPI.startTest);
    yield put(startTestSuccess(response.data));
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to start test';
    yield put(startTestFailure(errorMessage));
  }
}

// Get current test saga
function* getCurrentTestSaga() {
  try {
    const response = yield call(testAPI.getCurrentAttempt);
    yield put(getCurrentTestSuccess(response.data));
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to get test attempt';
    yield put(getCurrentTestFailure(errorMessage));
  }
}

// Submit test saga
function* submitTestSaga(action) {
  try {
    yield call(testAPI.submitTest, action.payload);
    yield put(submitTestSuccess());
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to submit test';
    yield put(submitTestFailure(errorMessage));
  }
}

// Get logs saga
function* getLogsSaga(action) {
  try {
    const response = yield call(testAPI.getEventLogs, action.payload);
    yield put(getLogsSuccess(response.data));
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to get logs';
    yield put(getLogsFailure(errorMessage));
  }
}

// Watcher saga
export default function* testSaga() {
  yield takeLatest(TEST_START_REQUEST, startTestSaga);
  yield takeLatest(TEST_GET_CURRENT_REQUEST, getCurrentTestSaga);
  yield takeLatest(TEST_SUBMIT_REQUEST, submitTestSaga);
  yield takeLatest(TEST_GET_LOGS_REQUEST, getLogsSaga);
}
