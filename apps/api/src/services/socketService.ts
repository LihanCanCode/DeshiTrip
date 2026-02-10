import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: SocketIOServer;

export const initSocket = (server: HTTPServer) => {
    io = new SocketIOServer(server, {
        cors: {
            origin: '*', // In production, restrict this to your frontend URL
            methods: ['GET', 'POST'],
        },
    });

    console.log('[socket]: Socket.io initialized');

    io.on('connection', (socket) => {
        console.log('[socket]: Client connected:', socket.id);

        socket.on('join_group', (groupId: string) => {
            socket.join(groupId);
            console.log(`[socket]: User ${socket.id} joined room ${groupId}`);
        });

        socket.on('disconnect', () => {
            console.log('[socket]: Client disconnected:', socket.id);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

export const emitToGroup = (groupId: string, event: string, data: any) => {
    if (io) {
        io.to(groupId).emit(event, data);
    }
};
