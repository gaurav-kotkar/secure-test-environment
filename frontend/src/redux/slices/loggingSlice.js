// Action types
export const LOGGING_ADD_EVENT = 'LOGGING_ADD_EVENT';
export const LOGGING_BATCH_SEND_REQUEST = 'LOGGING_BATCH_SEND_REQUEST';
export const LOGGING_BATCH_SEND_SUCCESS = 'LOGGING_BATCH_SEND_SUCCESS';
export const LOGGING_BATCH_SEND_FAILURE = 'LOGGING_BATCH_SEND_FAILURE';
export const LOGGING_CLEAR_QUEUE = 'LOGGING_CLEAR_QUEUE';
export const LOGGING_LOAD_FROM_STORAGE = 'LOGGING_LOAD_FROM_STORAGE';

// Initial state
const initialState = {
  eventQueue: [],
  sending: false,
  error: null,
  lastSentAt: null
};

// Reducer
const loggingReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGGING_ADD_EVENT:
      return {
        ...state,
        eventQueue: [...state.eventQueue, action.payload]
      };

    case LOGGING_BATCH_SEND_REQUEST:
      return {
        ...state,
        sending: true,
        error: null
      };

    case LOGGING_BATCH_SEND_SUCCESS:
      return {
        ...state,
        eventQueue: [],
        sending: false,
        lastSentAt: Date.now(),
        error: null
      };

    case LOGGING_BATCH_SEND_FAILURE:
      return {
        ...state,
        sending: false,
        error: action.payload
      };

    case LOGGING_CLEAR_QUEUE:
      return {
        ...state,
        eventQueue: []
      };

    case LOGGING_LOAD_FROM_STORAGE:
      return {
        ...state,
        eventQueue: action.payload
      };

    default:
      return state;
  }
};

// Action creators
export const addEvent = (event) => ({
  type: LOGGING_ADD_EVENT,
  payload: event
});

export const batchSendRequest = (attemptId, events) => ({
  type: LOGGING_BATCH_SEND_REQUEST,
  payload: { attemptId, events }
});

export const batchSendSuccess = () => ({
  type: LOGGING_BATCH_SEND_SUCCESS
});

export const batchSendFailure = (error) => ({
  type: LOGGING_BATCH_SEND_FAILURE,
  payload: error
});

export const clearQueue = () => ({
  type: LOGGING_CLEAR_QUEUE
});

export const loadFromStorage = (events) => ({
  type: LOGGING_LOAD_FROM_STORAGE,
  payload: events
});

export default loggingReducer;
