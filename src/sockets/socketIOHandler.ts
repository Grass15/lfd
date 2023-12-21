import {Server as SocketIOServer, Socket} from "socket.io";
import {server} from "../server";
import {Notification} from "./Notification";


interface Client {
    //clientId: string;
    socket: Socket;
    userId: number;
}

const clients: Client[] = [];
export const socketServer: SocketIOServer = new SocketIOServer(server);

console.log(server);

socketServer.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);
    //const clientId = generateUniqueClientId();

    socket.on('userId', (userId: number) => {
        clients.push({userId, socket});
    });
    //socket.emit('clientId', clientId);

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});


export const sendNotification = function (userId: number, notification: Notification) {
    const client = clients.find((c) => c.userId === userId);
    if (client) {
        client.socket.emit('notification', notification);
    }
}

function generateUniqueClientId(): string {
    return Math.random().toString(36).substring(2, 15);
}
