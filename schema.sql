-- Create the users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Create the songs table
CREATE TABLE songs (
    song_id INT PRIMARY KEY,
    song_name VARCHAR(255) UNIQUE NOT NULL
);

-- Insert values into the songs table
DO $$
BEGIN
    FOR i IN 1..30 LOOP
        INSERT INTO songs (song_id, song_name) VALUES (i, i || '.mp3');
    END LOOP;
END $$;

-- Create the songs_freq table
CREATE TABLE songs_freq (
    song_id INT PRIMARY KEY,
    play_count INT NOT NULL,
    FOREIGN KEY (song_id) REFERENCES songs(song_id) ON DELETE CASCADE
);

-- Create the playlists table
CREATE TABLE playlists (
    username VARCHAR(50) NOT NULL,
    song_id INT NOT NULL,
    song_name VARCHAR(255) UNIQUE NOT NULL,
    order_index INT NOT NULL,
    FOREIGN KEY (song_id) REFERENCES songs(song_id) ON DELETE CASCADE,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE,
    PRIMARY KEY (username, song_id)
);
