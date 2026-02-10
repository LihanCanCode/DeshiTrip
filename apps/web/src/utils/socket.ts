import { io } from 'socket.io-client';

const getSocketURL = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    // Remove /api suffix if it exists to get the server root
    return apiUrl.replace(/\/api$/, '');
};

const socket = io(getSocketURL(), {
    autoConnect: false,
    transports: ['polling', 'websocket'], // Polling first for better compatibility, then upgrade
});

export default socket;
