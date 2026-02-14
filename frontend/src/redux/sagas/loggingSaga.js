import { call, put, takeLatest, select, delay } from 'redux-saga/effects';
import { testAPI } from '../../services/api';
import {
  LOGGING_BATCH_SEND_REQUEST,
  batchSendSuccess,
  batchSendFailure
} from '../slices/loggingSlice';

// Batch send saga
function* batchSendSaga(action) {
  try {
    const { attemptId, events } = action.payload;
    
    if (events.length === 0) {
      yield put(batchSendSuccess());
      return;
    }

    // Send events to backend
    yield call(testAPI.logEvents, attemptId, events);
    
    // Clear localStorage after successful send
    localStorage.removeItem(`events_${attemptId}`);
    
    yield put(batchSendSuccess());
  } catch (error) {
    console.error('Failed to send events:', error);
    const errorMessage = error.response?.data?.message || 'Failed to send events';
    yield put(batchSendFailure(errorMessage));
    
    // Keep events in localStorage for retry
  }
}

// Watcher saga
export default function* loggingSaga() {
  yield takeLatest(LOGGING_BATCH_SEND_REQUEST, batchSendSaga);
}
