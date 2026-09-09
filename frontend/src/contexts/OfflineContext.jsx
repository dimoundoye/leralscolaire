import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { syncEngine } from '../services/syncEngine';

const OfflineContext = createContext(null);

export function OfflineProvider({ children }) {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState(null); // { time, count }
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const refreshPendingCount = useCallback(async () => {
    const count = await syncEngine.getPendingCount();
    setPendingCount(count);
  }, []);

  useEffect(() => {
    // Initialisation du compteur
    refreshPendingCount();

    // Écoute des événements du SyncEngine
    const unsubscribe = syncEngine.subscribe((eventData) => {
      if (eventData.event === 'online') {
        setIsOnline(true);
      } else if (eventData.event === 'offline') {
        setIsOnline(false);
      } else if (eventData.event === 'sync_start') {
        setIsSyncing(true);
      } else if (eventData.event === 'sync_end') {
        setIsSyncing(false);
        refreshPendingCount();
        if (eventData.count > 0) {
          setLastSyncResult({ time: new Date(), count: eventData.count });
          setShowSuccessToast(true);
          setTimeout(() => setShowSuccessToast(false), 4000);
        }
      } else if (eventData.event === 'enqueued' || eventData.event === 'item_synced' || eventData.event === 'item_failed') {
        refreshPendingCount();
      }
    });

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshPendingCount]);

  const syncNow = useCallback(() => {
    if (isOnline) {
      syncEngine.processQueue();
    }
  }, [isOnline]);

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        pendingCount,
        isSyncing,
        lastSyncResult,
        showSuccessToast,
        syncNow,
        refreshPendingCount
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}

export default OfflineContext;
