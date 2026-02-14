import { call, put, takeLatest } from 'redux-saga/effects';
import { authAPI } from '../../services/api';
import {
  AUTH_REGISTER_REQUEST,
  AUTH_LOGIN_REQUEST,
  AUTH_LOAD_USER,
  registerSuccess,
  registerFailure,
  loginSuccess,
  loginFailure,
  setUser
} from '../slices/authSlice';

// Register saga
function* registerSaga(action) {
  try {
    const response = yield call(authAPI.register, action.payload);
    yield put(registerSuccess());
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Registration failed';
    yield put(registerFailure(errorMessage));
    throw error;
  }
}

// Login saga
function* loginSaga(action) {
  try {
    const response = yield call(authAPI.login, action.payload);
    const { token, user } = response.data;
    
    // Store token in localStorage
    localStorage.setItem('token', token);
    
    yield put(loginSuccess({ token, user }));
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Login failed';
    yield put(loginFailure(errorMessage));
    throw error;
  }
}

// Load user saga
function* loadUserSaga() {
  try {
    const response = yield call(authAPI.getCurrentUser);
    yield put(setUser(response.data.user));
  } catch (error) {
    console.error('Failed to load user:', error);
    localStorage.removeItem('token');
  }
}

// Watcher saga
export default function* authSaga() {
  yield takeLatest(AUTH_REGISTER_REQUEST, registerSaga);
  yield takeLatest(AUTH_LOGIN_REQUEST, loginSaga);
  yield takeLatest(AUTH_LOAD_USER, loadUserSaga);
}
