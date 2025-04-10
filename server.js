require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { createClient } = require('redis');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);


const uri = process.env.MONGO_URI;
const redisUrl = process.env.REDIS_URL;
const dbName = 'sample_mflix';
const collectionsToWatch = ['movies', 'users', 'comments'];


const client = new MongoClient(uri);


const redisClient = createClient({ url: redisUrl });
redisClient.connect()
  .then(() => console.log('✅ Connected to Redis'))
  .catch(err => console.error('❌ Redis connection failed:', err));


app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'gatekeeper.html'));
});


app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});


function denormalizeChange(change, colName) {
  const base = {
    _id: change.documentKey?._id,
    operationType: change.operationType,
    collection: colName,
    timestamp: new Date().toISOString(),
  };

  const fullDoc = change.fullDocument || {};

  switch (colName) {
    case 'movies':
      return {
        ...base,
        title: fullDoc.title,
        plot: fullDoc.plot,
        genres: fullDoc.genres,
        released: fullDoc.released,
        imdb_rating: fullDoc.imdb?.rating,
        num_comments: fullDoc.num_mflix_comments,
      };
    case 'users':
      return {
        ...base,
        name: fullDoc.name,
        email: fullDoc.email,
      };
    case 'comments':
      return {
        ...base,
        name: fullDoc.name,
        email: fullDoc.email,
        movie_id: fullDoc.movie_id,
        text: fullDoc.text,
        date: fullDoc.date,
      };
    default:
      return { ...base, raw: fullDoc };
  }
}


function stringifyValues(obj) {
  const flat = {};
  for (const key in obj) {
    flat[key] =
      typeof obj[key] === 'object' || typeof obj[key] === 'number'
        ? JSON.stringify(obj[key])
        : String(obj[key]);
  }
  return flat;
}


async function pushChangesToRedis(change, colName) {
  const denormalized = denormalizeChange(change, colName);
  const stringified = stringifyValues(denormalized);

  try {
    await redisClient.xAdd('dbChanges', '*', stringified);
  } catch (err) {
    console.error('❌ Redis stream error:', err);
  }

  io.emit('dbChange', denormalized);
}


async function main() {
  // Connect to MongoDB
  await client.connect();
  console.log('✅ Connected to MongoDB');
  const db = client.db(dbName);

 
  collectionsToWatch.forEach(colName => {
    const collection = db.collection(colName);
    const changeStream = collection.watch([], { fullDocument: 'updateLookup' });
    changeStream.on('change', async (change) => {
      console.log(`🔄 Change detected in "${colName}":`, change);
      await pushChangesToRedis(change, colName);
    });
  });


  io.on('connection', (socket) => {
    console.log('⚡ Client connected');

    socket.on('login', async (username) => {
      const redisKey = `user:${username}:lastToken`;
      let lastToken = await redisClient.get(redisKey) || '$';

      console.log(`🔐 User "${username}" connected. Resuming from token: ${lastToken}`);

      async function poll() {
        try {
          const data = await redisClient.xRead(
            { key: 'dbChanges', id: lastToken },
            { BLOCK: 5000, COUNT: 10 }
          );
          if (data) {
            const entries = data[0].messages;
            for (const entry of entries) {
              socket.emit('dbChange', {
                token: entry.id,
                ...entry.message,
              });
              await redisClient.set(redisKey, entry.id);
              lastToken = entry.id;
            }
          }
          setImmediate(poll);
        } catch (err) {
          console.error('⚠️ Error reading Redis stream:', err);
          setTimeout(poll, 1000);
        }
      }
      poll();
    });

    socket.on('disconnect', () => {
      console.log('❌ Client disconnected');
    });
  });

  server.listen(3000, () => {
    console.log('🚀 Server listening on http://localhost:3000');
  });
}

main().catch(console.error);
