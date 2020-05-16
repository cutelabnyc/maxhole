const express = require("express");
const ws = require("ws");
const fs = require("fs");
const port = process.env.PORT || 3000;

const app = express();

app.get("/", (_, res) => {
    fs.readFile("index.html", "utf8", (err, data) => {
        if (err) {
            res.status(500).json(err);
        } else {
            res.type("text/html").send(data);
        }
    });
});

const httpServer = app.listen(port, () => console.log(`App listening on port ${port}`));

const wsServer = new ws.Server({ server: httpServer });
wsServer.on("connection", (socket) => {
    socket.on("message", (data) => {
        wsServer.clients.forEach((client) => {
            if (client !== socket) client.send(data);
        });
    });
}); 
