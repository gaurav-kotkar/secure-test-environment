// Action types
export const TEST_START_REQUEST = 'TEST_START_REQUEST';
export const TEST_START_SUCCESS = 'TEST_START_SUCCESS';
export const TEST_START_FAILURE = 'TEST_START_FAILURE';

export const TEST_GET_CURRENT_REQUEST = 'TEST_GET_CURRENT_REQUEST';
export const TEST_GET_CURRENT_SUCCESS = 'TEST_GET_CURRENT_SUCCESS';
export const TEST_GET_CURRENT_FAILURE = 'TEST_GET_CURRENT_FAILURE';

export const TEST_SUBMIT_REQUEST = 'TEST_SUBMIT_REQUEST';
export const TEST_SUBMIT_SUCCESS = 'TEST_SUBMIT_SUCCESS';
export const TEST_SUBMIT_FAILURE = 'TEST_SUBMIT_FAILURE';

export const TEST_INCREMENT_VIOLATION = 'TEST_INCREMENT_VIOLATION';

export const TEST_GET_LOGS_REQUEST = 'TEST_GET_LOGS_REQUEST';
export const TEST_GET_LOGS_SUCCESS = 'TEST_GET_LOGS_SUCCESS';
export const TEST_GET_LOGS_FAILURE = 'TEST_GET_LOGS_FAILURE';

// Initial state
const initialState = {
  currentAttempt: null,
  attemptId: null,
  violationCount: 0,
  logs: [],
  loading: false,
  error: null,
  testSubmitted: false
};

// Reducer
const testReducer = (state = initialState, action) => {
  switch (action.type) {
    case TEST_START_REQUEST:
    case TEST_GET_CURRENT_REQUEST:
    case TEST_SUBMIT_REQUEST:
    case TEST_GET_LOGS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case TEST_START_SUCCESS:
      return {
        ...state,
        attemptId: action.payload.attemptId,
        currentAttempt: action.payload,
        violationCount: 0,
        loading: false,
        testSubmitted: false,
        error: null
      };

    case TEST_GET_CURRENT_SUCCESS:
      return {
        ...state,
        currentAttempt: action.payload.attempt,
        attemptId: action.payload.attempt?.attempt_id || null,
        violationCount: action.payload.attempt?.violation_count || 0,
        loading: false,
        error: null
      };

    case TEST_INCREMENT_VIOLATION:
      return {
        ...state,
        violationCount: state.violationCount + 1
      };

    case TEST_SUBMIT_SUCCESS:
      return {
        ...state,
        loading: false,
        testSubmitted: true,
        error: null
      };

    case TEST_GET_LOGS_SUCCESS:
      return {
        ...state,
        logs: action.payload.logs,
        loading: false,
        error: null
      };

    case TEST_START_FAILURE:
    case TEST_GET_CURRENT_FAILURE:
    case TEST_SUBMIT_FAILURE:
    case TEST_GET_LOGS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    default:
      return state;
  }
};

// Action creators
export const startTestRequest = () => ({
  type: TEST_START_REQUEST
});

export const startTestSuccess = (data) => ({
  type: TEST_START_SUCCESS,
  payload: data
});

export const startTestFailure = (error) => ({
  type: TEST_START_FAILURE,
  payload: error
});

export const getCurrentTestRequest = () => ({
  type: TEST_GET_CURRENT_REQUEST
});

export const getCurrentTestSuccess = (data) => ({
  type: TEST_GET_CURRENT_SUCCESS,
  payload: data
});

export const getCurrentTestFailure = (error) => ({
  type: TEST_GET_CURRENT_FAILURE,
  payload: error
});

export const submitTestRequest = (attemptId) => ({
  type: TEST_SUBMIT_REQUEST,
  payload: attemptId
});

export const submitTestSuccess = () => ({
  type: TEST_SUBMIT_SUCCESS
});

export const submitTestFailure = (error) => ({
  type: TEST_SUBMIT_FAILURE,
  payload: error
});

export const incrementViolation = () => ({
  type: TEST_INCREMENT_VIOLATION
});

export const getLogsRequest = (attemptId) => ({
  type: TEST_GET_LOGS_REQUEST,
  payload: attemptId
});

export const getLogsSuccess = (data) => ({
  type: TEST_GET_LOGS_SUCCESS,
  payload: data
});

export const getLogsFailure = (error) => ({
  type: TEST_GET_LOGS_FAILURE,
  payload: error
});

export default testReducer;
