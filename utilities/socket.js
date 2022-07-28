const Logger = require("./logger");

let io;

module.exports = {
  init: (server) => {
    io = require("socket.io")(server, {
      cors: {
        origin: "*",
      },
    });
    io.on("connection", (socket) => {
      let sessionID = socket.id;
      Logger.info(`${sessionID} connected on socket io`);
      socket.join("data_from_mqtt");
      socket.join("telemetry_from_mqtt");
      socket.join("change_port_status");
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
