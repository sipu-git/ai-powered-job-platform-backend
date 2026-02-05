import { Server } from "socket.io";

let io: Server;
export function initSocket(server: any) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    },
  });

  io.on("connection", (socket:any) => {
    console.log("Client connected:", socket.id);

    socket.on("joinRole", (role: string) => {
      socket.join(role);
      console.log(`Socket ${socket.id} joined room: ${role}`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
}

export function emitGlobal(event: string, payload?: any) {
  if (!io) return;
  io.emit(event, payload);
}

export function emitToRoom(room: string, event: string, payload?: any) {
  if (!io) return;
  io.to(room).emit(event, payload);
}
