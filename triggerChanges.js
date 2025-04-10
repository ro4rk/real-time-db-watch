require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
const dbName = 'sample_mflix';

async function main() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");
    const db = client.db(dbName);

    const movie1 = {
      title: "Good Will Hunting: Revisited",
      plot: "Will Hunting, now a professor, is challenged by a student who reminds him of his past.",
      genres: ["Drama"],
      runtime: 128,
      cast: ["Matt Damon", "Robin Williams"],
      directors: ["Gus Van Sant"],
      writers: ["Matt Damon", "Ben Affleck"],
      languages: ["English"],
      released: new Date("2024-12-15"),
      poster: "https://example.com/gwh-revisited.jpg",
      countries: ["USA"],
      imdb: { rating: 8.3, votes: 1200000, id: 113344 },
      type: "movie",
      lastupdated: new Date().toISOString()
    };

    const result1 = await db.collection('movies').insertOne(movie1);
    const movieId1 = result1.insertedId;
    console.log("🎬 Inserted:", movie1.title);
    await delay();

    const movie2 = {
      title: "Once Upon a Time in Hollywood 2",
      plot: "Rick Dalton and Cliff Booth head to Italy for spaghetti western stardom.",
      genres: ["Comedy", "Drama"],
      runtime: 145,
      cast: ["Leonardo DiCaprio", "Brad Pitt", "Margot Robbie"],
      directors: ["Quentin Tarantino"],
      writers: ["Quentin Tarantino"],
      languages: ["English", "Italian"],
      released: new Date("2025-07-04"),
      poster: "https://example.com/ouatih2.jpg",
      countries: ["USA", "Italy"],
      imdb: { rating: 7.9, votes: 900000, id: 5566778 },
      type: "movie",
      lastupdated: new Date().toISOString()
    };

    const result2 = await db.collection('movies').insertOne(movie2);
    const movieId2 = result2.insertedId;
    console.log("🎬 Inserted:", movie2.title);
    await delay();

    await db.collection('movies').updateOne(
      { _id: movieId1 },
      { $set: { title: "Good Will Hunting: Legacy" } }
    );
    console.log("🔄 Updated GWH title");
    await delay();

    await db.collection('movies').updateOne(
      { _id: movieId2 },
      { $inc: { "imdb.votes": 15000 } }
    );
    console.log("📈 Boosted votes for OUATIH2");
    await delay();

    await db.collection('movies').updateOne(
      { _id: movieId1 },
      { $push: { cast: "Minnie Driver" } }
    );
    console.log("➕ Added cast to GWH");
    await delay();

    await db.collection('movies').deleteOne({ _id: movieId1 });
    console.log("🗑️ Deleted GWH movie");
    await delay();

    const user = {
      name: "Will Hunting",
      email: "will@harvard.edu",
      password: "howdoyoulikethem_apples"
    };

    const existing = await db.collection('users').findOne({ email: user.email });
    if (!existing) {
      await db.collection('users').insertOne(user);
      console.log("👤 New user:", user.name);
    } else {
      console.log("⚠️ User already exists");
    }

    await delay();

    await db.collection('users').updateOne(
      { email: "will@harvard.edu" },
      { $set: { name: "Professor Will Hunting" } }
    );
    console.log("🧠 User name updated");
    await delay();

    await db.collection('users').deleteOne({ email: "will@harvard.edu" });
    console.log("🗑️ User deleted");

    await delay();

    await db.collection('movies').deleteOne({ _id: movieId2 });
    console.log("🗑️ OUATIH2 movie removed");

    console.log("🎉 Simulation complete");
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await client.close();
    console.log("🔌 Disconnected from MongoDB");
  }
}

function delay(ms = 4000) {
  return new Promise(res => setTimeout(res, ms));
}

main();
