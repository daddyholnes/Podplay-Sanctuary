/**
 * Redux Store Configuration
 * 
 * Main store setup with Redux Toolkit, RTK Query, and middleware
 * Provides centralized state management for the entire application
 */

import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { 
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';

import { rootReducer } from './rootReducer';
import { apiMiddleware } from './middleware/apiMiddleware';
import { socketMiddleware } from './middleware/socketMiddleware';
import { errorMiddleware } from './middleware/errorMiddleware';
import { loggingMiddleware } from './middleware/loggingMiddleware';

// Persist configuration
const persistConfig = {
  key: 'podplay-sanctuary',
  version: 1,
  storage,
  whitelist: [
    'chat',
    'workspace', 
    'preferences',
    'mcp',
    'ui'
  ],
  blacklist: [
    'api',
    'socket',
    'notifications'
  ]
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store with middleware
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['items.dates']
      },
      thunk: {
        extraArgument: {
          // Add any extra dependencies here
        }
      }
    })
    .concat(
      apiMiddleware,
      socketMiddleware,
      errorMiddleware,
      loggingMiddleware
    ),
  devTools: process.env.NODE_ENV !== 'production' && {
    name: 'Podplay Sanctuary',
    trace: true,
    traceLimit: 25,
    actionSanitizer: (action) => ({
      ...action,
      // Sanitize sensitive data in dev tools
      payload: action.type.includes('auth') 
        ? { ...action.payload, token: '[REDACTED]' }
        : action.payload
    }),
    stateSanitizer: (state) => ({
      ...state,
      auth: state.auth ? { ...state.auth, token: '[REDACTED]' } : undefined
    })
  },
  preloadedState: undefined
});

// Create persistor
export const persistor = persistStore(store);

// Setup RTK Query listeners
setupListeners(store.dispatch);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Store utilities
export const getStoreState = () => store.getState();
export const dispatchAction = (action: any) => store.dispatch(action);

// Hot reloading for reducers in development
if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./rootReducer', () => {
    const newRootReducer = require('./rootReducer').rootReducer;
    store.replaceReducer(persistReducer(persistConfig, newRootReducer));
  });
}

// Store subscription utilities
export const subscribeToStore = (callback: () => void) => {
  return store.subscribe(callback);
};

// Action creators for common operations
export const resetStore = () => ({
  type: 'RESET_STORE'
});

export const hydrateStore = (state: Partial<RootState>) => ({
  type: 'HYDRATE_STORE',
  payload: state
});

// Store health check
export const isStoreHealthy = (): boolean => {
  try {
    const state = store.getState();
    return state !== null && typeof state === 'object';
  } catch (error) {
    console.error('Store health check failed:', error);
    return false;
  }
};

// Performance monitoring
if (process.env.NODE_ENV === 'development') {
  let actionCount = 0;
  store.subscribe(() => {
    actionCount++;
    if (actionCount % 100 === 0) {
      console.log(`Store actions dispatched: ${actionCount}`);
    }
  });
}

export default store;
