require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

const dbName = 'realtimeDB';
const collectionName = 'events';

app.use(express.static(path.join(__dirname, 'public')));

async function main() {
  await client.connect();
  console.log("Connected to MongoDB");

  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  const changeStream = collection.watch();

  changeStream.on('change', (change) => {
    console.log("Change detected:", change);
    io.emit('dbChange', change);
  });

  io.on('connection', (socket) => {
    console.log('Client connected');
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  server.listen(3000, () => {
    console.log('Server is listening on http://localhost:3000');
  });
}

main().catch(console.error);
