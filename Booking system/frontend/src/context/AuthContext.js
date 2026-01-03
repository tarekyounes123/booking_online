import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_USER':
      // Store user data in localStorage for session persistence
      if (action.payload) {
        localStorage.setItem('user', JSON.stringify(action.payload));
      }
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
        error: null
      };
    case 'LOGOUT':
      // Clear user data from localStorage on logout
      localStorage.removeItem('user');
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null
      };
    case 'SET_ERROR':
        return {
          ...state,
          error: action.payload,
          loading: false,
          isAuthenticated: false,
          user: null,
        };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: JSON.parse(localStorage.getItem('user')) || null, // Keep for initial data display, but not for auth status
    isAuthenticated: false, // Will be set to true by getMe or false by logout
    loading: true, // Start with loading true
    error: null
  });

  // On application load, check if the user has a valid session cookie
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        // The HttpOnly cookie is sent automatically by the browser.
        // If this call succeeds, the user is authenticated.
        const res = await authAPI.getMe();
        if (res.data.success && res.data.data) {
          dispatch({ type: 'SET_USER', payload: res.data.data });
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      } catch (error) {
        console.error('Session check failed:', error.response || error.message);
        if (localStorage.getItem('user')) {
          localStorage.removeItem('user');
        }
        dispatch({ type: 'LOGOUT' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    // Always check session on mount to verify the HttpOnly cookie
    checkUserSession();
  }, []);

  const login = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await authAPI.login({ email, password });
      // The backend now sets the HttpOnly cookie.
      // We just need to update the frontend state with user data.
      dispatch({
        type: 'SET_USER',
        payload: res.data.user
      });
      return { success: true, user: res.data.user };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      dispatch({
        type: 'SET_ERROR',
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Tell the backend to expire the cookie
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API error:', error);
      // Even if the backend logout fails, still clear the local session
    } finally {
      // Clear the user state in the frontend
      dispatch({ type: 'LOGOUT' });
    }
  };

  const value = {
    ...state,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};