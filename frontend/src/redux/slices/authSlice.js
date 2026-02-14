// Action types
export const AUTH_REGISTER_REQUEST = 'AUTH_REGISTER_REQUEST';
export const AUTH_REGISTER_SUCCESS = 'AUTH_REGISTER_SUCCESS';
export const AUTH_REGISTER_FAILURE = 'AUTH_REGISTER_FAILURE';

export const AUTH_LOGIN_REQUEST = 'AUTH_LOGIN_REQUEST';
export const AUTH_LOGIN_SUCCESS = 'AUTH_LOGIN_SUCCESS';
export const AUTH_LOGIN_FAILURE = 'AUTH_LOGIN_FAILURE';

export const AUTH_LOGOUT = 'AUTH_LOGOUT';

export const AUTH_LOAD_USER = 'AUTH_LOAD_USER';
export const AUTH_SET_USER = 'AUTH_SET_USER';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null
};

// Reducer
const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case AUTH_REGISTER_REQUEST:
    case AUTH_LOGIN_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case AUTH_REGISTER_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null
      };

    case AUTH_LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };

    case AUTH_SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true
      };

    case AUTH_REGISTER_FAILURE:
    case AUTH_LOGIN_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        isAuthenticated: false,
        token: null,
        user: null
      };

    case AUTH_LOGOUT:
      return {
        ...initialState,
        token: null,
        isAuthenticated: false
      };

    default:
      return state;
  }
};

// Action creators
export const registerRequest = (userData) => ({
  type: AUTH_REGISTER_REQUEST,
  payload: userData
});

export const registerSuccess = () => ({
  type: AUTH_REGISTER_SUCCESS
});

export const registerFailure = (error) => ({
  type: AUTH_REGISTER_FAILURE,
  payload: error
});

export const loginRequest = (credentials) => ({
  type: AUTH_LOGIN_REQUEST,
  payload: credentials
});

export const loginSuccess = (data) => ({
  type: AUTH_LOGIN_SUCCESS,
  payload: data
});

export const loginFailure = (error) => ({
  type: AUTH_LOGIN_FAILURE,
  payload: error
});

export const logout = () => ({
  type: AUTH_LOGOUT
});

export const loadUser = () => ({
  type: AUTH_LOAD_USER
});

export const setUser = (user) => ({
  type: AUTH_SET_USER,
  payload: user
});

export default authReducer;
