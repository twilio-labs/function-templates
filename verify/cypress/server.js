const express = require("express");
const http = require("http");
const path = require("path");

const app = express();

app.get("/", (req, res) => {
  res.sendFile(path.resolve("assets/index.html"));
});

const server = http.createServer(app);

server.listen("4040");
