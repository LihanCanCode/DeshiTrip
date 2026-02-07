"use client";

import { useEffect, useCallback } from 'react';
import api from '@/utils/api';
import { getOutbox, removeFromOutbox, isOnline } from '@/utils/offline';

export const SyncManager = () => {
    const handleSync = useCallback(async () => {
        if (!isOnline()) return;

        const outbox = getOutbox();
        if (outbox.length === 0) return;

        console.log(`[SyncManager] Internet restored. Syncing ${outbox.length} pending actions...`);

        for (const action of outbox) {
            try {
                // Determine endpoint based on type
                let endpoint = '/expenses';
                if (action.type === 'CREATE_GROUP') endpoint = '/groups';
                if (action.type === 'JOIN_GROUP') endpoint = '/groups/join';

                await api.post(endpoint, action.data);
                removeFromOutbox(action.id);
                console.log(`[SyncManager] Successfully synced action: ${action.type} (${action.id})`);
            } catch (err) {
                console.error(`[SyncManager] Failed to sync action: ${action.type} (${action.id})`, err);
                // We keep it in outbox for next retry unless it's a 4xx error that won't resolve
                const status = (err as any).response?.status;
                if (status >= 400 && status < 500) {
                    removeFromOutbox(action.id);
                }
            }
        }

        // Dispatch global event to notify pages to refresh
        window.dispatchEvent(new CustomEvent('app:sync-complete'));
    }, []);

    useEffect(() => {
        // Run sync on mount (in case we were offline and just opened the app)
        handleSync();

        // Listen for online event
        window.addEventListener('online', handleSync);
        return () => window.removeEventListener('online', handleSync);
    }, [handleSync]);

    return null; // Headless component
};
