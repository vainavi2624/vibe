# Vibe
Music Player

### Project Overview
**Vibe** is a full-featured music player application that I developed, integrating a robust music database managed with PostgreSQL. The project was designed to provide a seamless and enjoyable user experience, leveraging efficient data structures and algorithms for fast music data retrieval and management.

### Project Architecture
The project consists of a client-server architecture with the following components:

1. **Backend (Server-side)**
   - **Express.js**: Used to create the server and handle HTTP requests.
   - **PostgreSQL**: Acts as the relational database management system (RDBMS) to store user data, song metadata, and play counts.
   - **Node.js**: The runtime environment for executing server-side code.

2. **Frontend (Client-side)**
   - **HTML/CSS**: Structure and style the web pages, ensuring a visually appealing interface.
   - **JavaScript**: Manages the music player functionality, including search, play, pause, next, and previous song controls.

### Key Functionalities
1. **User Authentication**
   - **Registration**: New users can register by providing a username and password. The credentials are securely stored in PostgreSQL.
   - **Login**: Existing users can log in with their credentials, which are verified against the database.

2. **Music Database Management**
   - **Song Storage**: Song metadata, such as title, artist, and cover image URLs, are stored in PostgreSQL.
   - **Play Counts**: Play counts for songs are tracked and updated in the database, allowing for trending song features.

3. **Search and Playback**
   - **Search Functionality**: Users can search for songs by title or artist using a search bar. A Trie data structure is employed for efficient search operations.
   - **Playback Controls**: Users can play, pause, skip to the next song, or go back to the previous song. The current song's metadata is displayed, including the cover image, title, and artist.

4. **Trending Songs**
   - **Trending Songs Display**: Songs with the highest play counts are displayed in a trending section, allowing users to discover popular tracks.

### Technical Implementation
1. **Backend Implementation**
   - **Express.js**: Set up the server and defined routes for serving static files, handling user authentication, and managing song data.
   - **PostgreSQL Integration**: Used the `pg` library to connect to the PostgreSQL database. Defined SQL queries for inserting, updating, and retrieving user and song data.
   - **API Endpoints**: Created endpoints for user registration (`/register`), user login (`/login`), fetching songs (`/songs`), fetching a specific song (`/song/:id`), and updating play counts (`/playcount`).

2. **Frontend Implementation**
   - **HTML/CSS**: Developed structured HTML files (`index.html`, `home.html`, `register.html`, `login.html`) and styled them using CSS to ensure a cohesive design and user-friendly interface.
   - **JavaScript**: Implemented the main functionality in `script.js`, managing song search, playback controls, and UI updates.

### Challenges and Solutions
1. **Efficient Data Retrieval**
   - **Challenge**: Ensuring quick search and retrieval of songs from a potentially large dataset.
   - **Solution**: Employed a Trie data structure for the search functionality to provide efficient prefix-based search operations.

2. **User Authentication**
   - **Challenge**: Securely managing user credentials and ensuring smooth authentication.
   - **Solution**: Implemented registration and login functionalities with plain text password security for simplicity. Future enhancements could include hashed passwords and more robust security measures.

3. **Seamless User Experience**
   - **Challenge**: Creating an intuitive and responsive UI that enhances the user experience.
   - **Solution**: Used a combination of HTML, CSS, and JavaScript to build a visually appealing interface with responsive design elements.

### Conclusion
Vibe showcases my ability to design and implement a comprehensive web application, integrating frontend and backend technologies seamlessly. The project demonstrates my skills in database management, efficient data structures, user authentication, and creating an engaging user interface. Through this project, I have gained valuable experience in full-stack development and learned to tackle various challenges associated with building a real-world application.

---
