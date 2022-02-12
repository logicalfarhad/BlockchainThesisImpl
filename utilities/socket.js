const Logger = require("./logger");

let io;

module.exports = {
  init: (server) => {
    io = require("socket.io")(server, {
      cors: {
        origin: "*",
      },
    });
    //io.origins("*:*");
    io.on("connection", (socket) => {
      let sessionID = socket.id;
      Logger.info(`${sessionID} connected on socket io`);
      socket.join("stream_log");
      socket.join("machines_state");
      socket.join("data_from_mqtt");
      socket.on("disconnect", () => {
        Logger.info(`${sessionID} disconnect`);
      });
    });
    return io;
  },
  getIO: () => {
    if (!io) {
      return null;
    }
    return io;
  },
};
