import { io } from 'socket.io-client';

let socket = null;
const socketUrl =
    process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

export const getSocket = () => {
    if (!socket) {
        socket = io(socketUrl, {
            withCredentials: true,
            autoConnect: false
        });
    }
    return socket;
};

export const connectSocket = () => {
    const s = getSocket();
    if (!s.connected) {
        s.connect();
    }
    return s;
};

export const disconnectSocket = () => {
    if (socket && socket.connected) {
        socket.disconnect();
    }
};
