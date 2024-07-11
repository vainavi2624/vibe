const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { Client } = require('pg');
const session = require('express-session');

const app = express();
const port = 3000;

const db = new Client({
  user: "postgres",
  host: "localhost",
  database: "spotidb",
  password: "r25,h600,",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));

// Middleware for parsing JSON bodies
app.use(bodyParser.json());

app.use(session({
  secret: '8f3d2b4c-e5a1-47b9-9c2e-6f1a3d5b2c7e', // Replace with your own secret key
  resave: false,
  saveUninitialized: true,
}));


// app.use(bodyParser.urlencoded({ extended: true }));
// Serve static files from the "frontend" directory
// app.use(express.static(path.join(__dirname, 'frontend')));

app.use('/spotify-clone/images', express.static(path.join(__dirname, 'images')));

// Serve song files from the "songs" directory
app.use('/songs', express.static(path.join(__dirname, 'songs')));

app.get("/", (req, res) => {
  console.log('Serving home.html');
  res.sendFile(path.join(__dirname, 'frontend', 'home.html'));
});

app.use(express.static(path.join(__dirname, 'frontend')));

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'login.html'));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'register.html'));
});

app.get("/test", (req, res) => {
  res.send("Test route");
});


app.post("/register", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const checkResult = await db.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (checkResult.rows.length > 0) {
      res.send("User already exists. Try logging in.");
    } else {
      const result = await db.query(
        "INSERT INTO users (username, password) VALUES ($1, $2)",
        [username, password]
      );
      console.log(result);
      //res.sendFile(path.join(__dirname, 'frontend', 'login.html'));
      res.redirect('/login');
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const result = await db.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const storedPassword = user.password;

      if (password === storedPassword) {
        req.session.username = username;
        res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
      } else {
        res.send("Incorrect Password");
      }
    } else {
      res.send("User not found");
    }
  } catch (err) {
    console.log(err);
  }
});

// Endpoint to get song data
app.get('/songs', (req, res) => {
  const songs = [
    { "id": 1, "name": "1.mp3" },
{ "id": 2, "name": "2.mp3" },
{ "id": 3, "name": "3.mp3" },
{ "id": 4, "name": "4.mp3" },
{ "id": 5, "name": "5.mp3" },
{ "id": 6, "name": "6.mp3" },
{ "id": 7, "name": "7.mp3" },
{ "id": 8, "name": "8.mp3" },
{ "id": 9, "name": "9.mp3" },
{ "id": 10, "name": "10.mp3" },
{ "id": 11, "name": "11.mp3" },
{ "id": 12, "name": "12.mp3" },
{ "id": 13, "name": "13.mp3" },
{ "id": 14, "name": "14.mp3" },
{ "id": 15, "name": "15.mp3" },
{ "id": 16, "name": "16.mp3" },
{ "id": 17, "name": "17.mp3" },
{ "id": 18, "name": "18.mp3" },
{ "id": 19, "name": "19.mp3" },
{ "id": 20, "name": "20.mp3" },
{ "id": 21, "name": "21.mp3" },
{ "id": 22, "name": "22.mp3" },
{ "id": 23, "name": "23.mp3" },
{ "id": 24, "name": "24.mp3" },
{ "id": 25, "name": "25.mp3" },
{ "id": 26, "name": "26.mp3" },
{ "id": 27, "name": "27.mp3" },
{ "id": 28, "name": "28.mp3" },
{ "id": 29, "name": "29.mp3" },
{ "id": 30, "name": "30.mp3" }
    // Add all songs up to 30 here
  ];
  res.json(songs);
});

// Endpoint to get trending songs
app.get('/trending-songs', (req, res) => {
  const query = `
      SELECT s.song_id, s.song_name, f.play_count 
      FROM songs s
      INNER JOIN songs_freq f ON s.song_id = f.song_id
      ORDER BY f.play_count DESC 
      LIMIT 5
  `;

  db.query(query, (err, results) => {
      if (err) {
          console.error('Error fetching trending songs:', err);
          return res.status(500).json({ error: 'Error fetching trending songs' });
      }
      res.json(results.rows); // Use .rows for PostgreSQL
  });
});

// Endpoint to play a song and update play count
// Endpoint to play a song and update play count
app.post('/play-song', (req, res) => {
  const { song_id } = req.body;

  if (!song_id) {
    return res.status(400).send('song_id is required');
  }

  const incrementPlayCountQuery = `
      INSERT INTO songs_freq (song_id, play_count) 
      VALUES ($1, 1) 
      ON CONFLICT (song_id) 
      DO UPDATE SET play_count = songs_freq.play_count + 1
  `;

  db.query(incrementPlayCountQuery, [song_id], (err, result) => {
      if (err) {
          console.error('Error updating play count:', err);
          return res.status(500).send('Error updating play count');
      }
      res.send('Song play count updated');
  });
});


app.post("/savePlaylist", async (req, res) => {
  const username = req.session.username;
  const playlist = req.body.playlist;

  if (!username) {
      return res.status(401).json({ error: "User not logged in" });
  }

  try {
      // Delete the old playlist
      await db.query("DELETE FROM playlists WHERE username = $1", [username]);
      console.log(`Deleted ${deleteResult.rowCount} old playlist entries for user ${username}`);

      // Insert the new playlist
      console.log(`Inserting new playlist for user ${username}:`, playlist);
      for (let i = 0; i < playlist.length; i++) {
          const song = playlist[i];
          await db.query(
              "INSERT INTO playlists (username, song_id, song_name, order_index) VALUES ($1, $2, $3, $4)",
              [username, song.id, song.name, i]
          );
      }

      res.json({ success: true });
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
  }
  res.redirect('/');
});

// Retrieve user playlist
app.get("/getPlaylist", async (req, res) => {
  const username = req.session.username;

  if (!username) {
      return res.status(401).json({ error: "User not logged in" });
  }

  try {
      const result = await db.query(
          "SELECT song_id, song_name, order_index FROM playlists WHERE username = $1 ORDER BY order_index",
          [username]
      );

      const playlist = result.rows.map(row => ({
          id: row.song_id,
          name: row.song_name
      }));

      res.json(playlist);
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
  }
});

app.post("/logout", async (req, res) => {
  const username = req.session.username;
  const playlist = req.body.playlist;

  // Log the username and playlist for debugging
  console.log("Username:", username);
  console.log("Playlist:", playlist);

  if (!username) {
    return res.status(401).json({ error: "User not logged in" });
  }

  if (!playlist || !Array.isArray(playlist)) {
    return res.status(400).json({ error: "Invalid playlist data" });
  }

  try {
    // Save the playlist before destroying the session
    const deleteResult = await db.query("DELETE FROM playlists WHERE username = $1", [username]);
    console.log(`Deleted ${deleteResult.rowCount} old playlist entries for user ${username}`);

    // Insert the new playlist
    console.log(`Inserting new playlist for user ${username}:`, playlist);
    for (let i = 0; i < playlist.length; i++) {
      const song = playlist[i];
      await db.query(
        "INSERT INTO playlists (username, song_id, song_name, order_index) VALUES ($1, $2, $3, $4)",
        [username, song.id, song.name, i]
      );
    }

    // Log successful playlist insertion
    console.log(`Successfully saved new playlist for user ${username}`);

    // Destroy the session after saving the playlist
    req.session.destroy(err => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).send("Logout failed");
      }
      console.log(`Session destroyed for user ${username}`);
      return res.redirect('/');
    });
  } catch (err) {
    console.error('Error saving playlist:', err);
    return res.status(500).json({ error: "Database error" });
  }
});



// Serve the main HTML file for any other route
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
// });

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
