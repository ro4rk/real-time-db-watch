# Real-Time DB Watch

A real-time database watch and event streaming system that monitors changes in a MongoDB collection, denormalizes the data, and streams it to connected clients via Socket.IO. It uses Redis Streams for persistent buffering and token‑based message resume, and a slick, sci‑fi–themed dashboard for displaying live changes.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Setup & Installation](#setup--installation)
- [Usage Instructions](#usage-instructions)
- [Project Structure](#project-structure)
- [Demo](#demo)
- [Future Enhancements](#future-enhancements)
- [License](#license)

## Overview

This project implements a real-time monitoring system that automatically detects and displays changes (Create, Update, Delete) in selected MongoDB collections (`movies`, `users`, `comments`). The changes are denormalized for clarity and routed through Redis Streams (with token‑based resume) before being broadcast to a dynamic, visually engaging dashboard.

Users must log in to access the dashboard. Upon logging in, the system resumes the event stream from the last message they viewed, ensuring that no events are missed even if the user disconnects and reconnects.

## Features

- **Real-Time Change Detection:** Leverages MongoDB Change Streams with the `updateLookup` option to capture full document changes.
- **Data Denormalization:** Transforms raw change events into human-friendly formats according to the collection (movies, users, comments).
- **Redis Streams Integration:** Persists event messages and supports token-based resumption (so users can pick up where they left off).
- **Socket.IO Notifications:** Broadcasts updates to connected clients instantly.
- **Protected Dashboard:** Users must log in to view the dashboard; unauthenticated access redirects to the login page.
- **Stylish Frontend:** A sci‑fi themed UI complete with constellations, shooting stars, and orbiting planets.
- **Simulation Script:** A separate script (`triggerChanges.js`) simulates multiple CRUD operations with real-world–themed data (using references from *The Matrix*, *Good Will Hunting*, and *Once Upon a Time in Hollywood*).

## Architecture

The system is composed of three main components:

1. **MongoDB Change Stream:**  
   - Listens for changes on selected collections in the `sample_mflix` database.
   - Uses the `updateLookup` option to include full documents on update events.

2. **Redis Streams:**  
   - Receives the denormalized change events (converted to flat, stringified key-value pairs for compatibility).
   - Stores a persistent stream of events for each user.
   - Uses token‑based resume logic to allow users to pick up from where they left off.

3. **Socket.IO & Dashboard:**  
   - A Node.js server emits events via Socket.IO in real-time.
   - The frontend dashboard (styled with neon and cosmic animations) listens for updates and displays them in three sections: Created, Updated, and Deleted Changes.
   - A simple login mechanism (using sessionStorage) enforces authenticated access.

## Tech Stack

- **Backend:** Node.js, Express
- **Database:** MongoDB Atlas (using Change Streams)
- **Streaming:** Redis Streams
- **Real-Time Communication:** Socket.IO
- **Frontend:** HTML5, CSS3 (custom sci‑fi design), JavaScript
- **Environment Management:** dotenv

## Setup & Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/yourusername/real-time-db-watch.git
   cd real-time-db-watch
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Create a `.env` File:**

   Create a file called `.env` in the root directory and add your configuration:

   ```env
   MONGO_URI=your_mongodb_atlas_connection_string
   REDIS_URL=redis://default:your_redis_password@your_redis_host:your_redis_port
   ```

4. **Set Up Redis (if using a local instance, start Redis server).**  
   For a cloud instance, ensure your credentials in `.env` are correct.

5. **(Optional) Run in Development Mode with `concurrently`:**

   You can install concurrently to run both server and simulation scripts:

   ```bash
   npm install -g concurrently
   ```

   Then add this to your `package.json`:

   ```json
   "scripts": {
     "dev": "concurrently \"node server.js\" \"node triggerChanges.js\""
   }
   ```

   Run with:

   ```bash
   npm run dev
   ```

## Usage Instructions

1. **Start the Server:**

   In one terminal, run:

   ```bash
   node server.js
   ```

2. **Simulate Changes:**

   In another terminal, run the simulation script:

   ```bash
   node triggerChanges.js
   ```

3. **Login and Dashboard:**

   - Open your browser and navigate to `http://localhost:3000/`.
   - You will be redirected to the login page (if not logged in).
   - Use the credentials set in your `login.html` (for example, `admin` and `1234`).
   - After login, you'll be redirected to the dashboard which displays real-time updates from MongoDB.

## Project Structure

```
real-time-db-watch/
├── .env                  # Environment variables
├── package.json          # NPM configuration and scripts
├── server.js             # Main server file: MongoDB, Redis, Socket.IO
├── triggerChanges.js     # Simulation script to generate CRUD events
└── public/               # Front-end assets
    ├── index.html       # Dashboard page (protected)
    ├── login.html       # Login page
    ├── gatekeeper.html  # Redirect page that checks login state
    └── styles.css       # (Optional) Additional CSS if separated
```

## Demo

When you run the server and simulation, you should see:

- **Console logs:** Real-time logs of changes detected in MongoDB, Redis stream operations, and Socket.IO connections.
- **Dashboard UI:** Dynamic sections for "Created Changes", "Updated Changes", and "Deleted Changes" populated in real time.
- **Visual Effects:** Constellation canvas, shooting stars, and orbiting planets providing a cosmic feel.

## Future Enhancements

- **Improved Authentication:** Backend-based authentication (using JWT or session cookies) instead of client-side sessionStorage.
- **Enhanced Data Filtering:** Advanced filtering options on the dashboard (e.g., filtering by collection or operation type).
- **Analytics & Logging:** Implement a more robust logging system and analytics dashboard for the events.
- **Error Handling & Retry Logic:** More comprehensive error handling for production readiness.
- **Deployment:** Dockerize the application and deploy on a cloud provider like AWS, DigitalOcean, or Heroku.

