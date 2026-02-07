"use client";

import { v4 as uuidv4 } from 'uuid';

export interface PendingAction {
    id: string;
    type: 'ADD_EXPENSE' | 'CREATE_GROUP' | 'JOIN_GROUP' | 'SETTLE';
    data: any;
    timestamp: number;
}

const CACHE_PREFIX = 'deshitrip_cache_';
const OUTBOX_KEY = 'deshitrip_outbox';

export const saveToCache = (key: string, data: any) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(data));
    } catch (e) {
        console.error('Failed to save to cache:', e);
    }
};

export const getFromCache = (key: string) => {
    if (typeof window === 'undefined') return null;
    try {
        const data = localStorage.getItem(CACHE_PREFIX + key);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error('Failed to read from cache:', e);
        return null;
    }
};

export const addToOutbox = (type: PendingAction['type'], data: any) => {
    if (typeof window === 'undefined') return;
    const action: PendingAction = {
        id: uuidv4(),
        type,
        data,
        timestamp: Date.now()
    };
    const outbox = getOutbox();
    outbox.push(action);
    localStorage.setItem(OUTBOX_KEY, JSON.stringify(outbox));
    return action;
};

export const getOutbox = (): PendingAction[] => {
    if (typeof window === 'undefined') return [];
    try {
        const data = localStorage.getItem(OUTBOX_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
};

export const removeFromOutbox = (id: string) => {
    if (typeof window === 'undefined') return;
    const outbox = getOutbox().filter(a => a.id !== id);
    localStorage.setItem(OUTBOX_KEY, JSON.stringify(outbox));
};

export const isOnline = () => {
    if (typeof window === 'undefined') return true;
    return navigator.onLine;
};
