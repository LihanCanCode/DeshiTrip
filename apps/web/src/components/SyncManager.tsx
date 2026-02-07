"use client";

import { useEffect, useCallback } from 'react';
import api from '@/utils/api';
import { getOutbox, removeFromOutbox, isOnline, saveToCache } from '@/utils/offline';

export const SyncManager = () => {
    const warmCache = useCallback(async () => {
        if (!isOnline()) return;

        try {
            console.log('[SyncManager] Warming cache...');
            // 1. Fetch all groups
            const groupsRes = await api.get('/groups');
            const groups = groupsRes.data;
            saveToCache('groups', groups);

            // 2. Fetch expenses for each group (limit to recent groups for efficiency)
            // For now, we fetch all active groups' expenses
            for (const group of groups) {
                try {
                    const [expensesRes, summaryRes] = await Promise.all([
                        api.get(`/expenses/group/${group._id}`),
                        api.get(`/expenses/summary/${group._id}`)
                    ]);
                    saveToCache(`expenses_${group._id}`, expensesRes.data);
                    saveToCache(`summary_${group._id}`, summaryRes.data);
                } catch (e) {
                    console.error(`[SyncManager] Failed to warm cache for group ${group._id}:`, e);
                }
            }
            console.log('[SyncManager] Cache warming complete.');
        } catch (err) {
            console.error('[SyncManager] Failed to warm cache:', err);
        }
    }, []);

    const handleSync = useCallback(async () => {
        if (!isOnline()) return;

        const outbox = getOutbox();

        // Even if outbox is empty, we warm the cache
        if (outbox.length > 0) {
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
        }

        // Always warm cache after sync attempt if online
        warmCache();
    }, [warmCache]);

    useEffect(() => {
        // Run sync on mount (in case we were offline and just opened the app)
        handleSync();

        // Listen for online event
        window.addEventListener('online', handleSync);
        return () => window.removeEventListener('online', handleSync);
    }, [handleSync]);

    return null; // Headless component
};
