// Define the TrieNode class to represent each node in the Trie
class TrieNode {
    constructor() {
        this.children = {};
        this.isEndOfWord = false;
        this.song = null;
    }
}

// Define the Trie class to manage the insertion and search functionalities
class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    // Insert a word into the Trie
    insert(word, song) {
        let node = this.root;
        for (let char of word) {
            if (!node.children[char]) {
                node.children[char] = new TrieNode();
            }
            node = node.children[char];
        }
        node.isEndOfWord = true;
        node.song = song;
    }

    // Search for a word in the Trie
    search(word) {
        let node = this.root;
        for (let char of word) {
            if (!node.children[char]) {
                return null;
            }
            node = node.children[char];
        }
        return node;
    }

    // Search for words that start with a given prefix
    startsWith(prefix) {
        let node = this.root;
        for (let char of prefix) {
            if (!node.children[char]) {
                return [];
            }
            node = node.children[char];
        }
        return this.getWords(node);
    }

    // Get all words starting from a given node
    getWords(node) {
        let words = [];
        if (node.isEndOfWord) {
            words.push(node.song);
        }
        for (let char in node.children) {
            words = words.concat(this.getWords(node.children[char]));
        }
        return words;
    }
}

// Initialize global variables
let currentSongIndex = 0;
let userPlaylist = [];
let universalSource = [];
let isPlaying = false;
const songTrie = new Trie();
const recentSongs = [];

// Set up event listeners after the DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Fetch the universal source list from the server
    fetch('/songs')
        .then(response => response.json())
        .then(data => {
            universalSource = data;
            // Insert each song into the Trie for search functionality
            universalSource.forEach(song => songTrie.insert(song.name.toLowerCase(), song));
        });

    fetch('/getPlaylist')
        .then(response => response.json())
        .then(data => {
            userPlaylist = data;
            updateCurrentSong();
        });

    fetch('/trending-songs')
    .then(response => response.json())
    .then(songs => {
        const trendingSongsList = document.getElementById('trending-songs-list');
        trendingSongsList.innerHTML = '';

        songs.forEach(song => {
            const songItem = document.createElement('li');
            
            const songImage = document.createElement('img');
            // Set the default image path for trending songs
            let imagePath = `/spotify-clone/images/${song.song_id}.jpg`;
            songImage.src = imagePath;
            songImage.alt = song.song_name;

            const songInfo = document.createElement('span');
            songInfo.textContent = `${song.song_name} (${song.play_count} plays)`;

            songItem.appendChild(songImage);
            songItem.appendChild(songInfo);

            songItem.addEventListener('click', () => {
                addToPlaylistAndPlay(song);
            });

            trendingSongsList.appendChild(songItem);
        });
    });

    // Set up event listeners for various controls
    document.getElementById('prev').addEventListener('click', prevSong);
    document.getElementById('next').addEventListener('click', nextSong);
    document.getElementById('functions').addEventListener('change', handleFunctionChange);
    document.getElementById('search').addEventListener('input', handleSearch);
    document.getElementById('logout').addEventListener('click', () => {
        // Ensure `userPlaylist` is defined and is an array
        if (!userPlaylist || !Array.isArray(userPlaylist)) {
          console.error('Invalid playlist data');
          return;
        }
      
        fetch('/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ playlist: userPlaylist }),
        })
        .then(response => {
          if (response.ok) {
            window.location.href = '/';
          } else {
            return response.json().then(error => {
              console.error('Logout failed:', error);
            });
          }
        })
        .catch(err => console.error('Error logging out:', err));
      });
      

    // Save playlist before the page unloads
    window.addEventListener('beforeunload', savePlaylist);
});

function savePlaylist() {
    fetch('/savePlaylist', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playlist: userPlaylist }),
    }).catch(err => console.error('Error saving playlist:', err));
}

// Update the current song details
// function updateCurrentSong() {
//     const currentSong = userPlaylist[currentSongIndex];
//     if (currentSong) {
//         document.getElementById('current-song-name').textContent = currentSong.name;
//         //document.getElementById('current-song-img').src = `./images/${currentSong.id}.jpg`;
//         // Set the default image path
//     let imagePath = `/spotify-clone/images/${currentSong.id}.jpg`;
//     document.getElementById('current-song-img').src = imagePath;

//     // // Check if the .jpg file exists, otherwise fall back to .jpeg
//     // fetch(imagePath)
//     //     .then(response => {
//     //         if (!response.ok) {
//     //             // If .jpg doesn't exist, use .jpeg
//     //             imagePath = `/spotify-clone/images/${currentSong.id}.jpeg`;
//     //         }
//     //     })
//     //     .catch(error => {
//     //         console.error('Error checking image file:', error);
//     //         // Handle error (optional)
//     //     })
//     //     .finally(() => {
//     //         // Update the image source
//     //         document.getElementById('current-song-img').src = imagePath;
//     //     });

//         const audioElement = document.getElementById('audioElement');
//         if (audioElement) {
//             audioElement.src = `./songs/${currentSong.id}.mp3`;
//             audioElement.play(); // Automatically play the current song
//         }
//         recentSongs.push(currentSong); // Add to recent songs
//     }
// }

function updateCurrentSong() {
    const currentSong = userPlaylist[currentSongIndex];
    console.log('Current Song:', currentSong); // Add this line to check current song details
    if (currentSong) {
        const songId = currentSong.id ? currentSong.id : currentSong.song_id;
        const songName = currentSong.name ? currentSong.name : currentSong.song_name;
        document.getElementById('current-song-name').textContent = songName;
        document.getElementById('current-song-img').src = `/spotify-clone/images/${songId}.jpg`;

        const audioElement = document.getElementById('audioElement');
        if (audioElement) {
            audioElement.src = `./songs/${songId}.mp3`;
            audioElement.play(); // Automatically play the current song

            // Update play count on the server
            console.log('Updating play count for song_id:', songId); // Add this line to check song_id
            fetch('/play-song', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ song_id: songId })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error updating play count');
                }
                return response.text();
            })
            .then(data => {
                console.log(data);
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }

        recentSongs.push(currentSong); // Add to recent songs
        audioElement.onended = nextSong;
    }
}


// Play the next song
function nextSong() {
    if (userPlaylist.length > 0) {
        currentSongIndex = (currentSongIndex + 1) % userPlaylist.length;
        updateCurrentSong();
    }
}

// Play the previous song
function prevSong() {
    if (userPlaylist.length > 0) {
        currentSongIndex = (currentSongIndex - 1 + userPlaylist.length) % userPlaylist.length;
        updateCurrentSong();
    }
}

// Handle the selection of different functions from the dropdown menu
function handleFunctionChange(event) {
    event.preventDefault();
    const selectedFunction = event.target.value;
    const dropdown = document.getElementById('functions');

  if (!selectedFunction) {
    dropdown.options[0].textContent = 'Menu';
  } else {
    dropdown.options[0].textContent = selectedFunction;
  }
    switch (selectedFunction) {
        case 'add':
            addSong();
            break;
        case 'delete':
            deleteSong();
            break;
        case 'display':
            displayPlaylist();
            break;
        case 'total':
            totalSongs();
            break;
        case 'play':
            playSelectedSong();
            break;
        case 'recent':
            displayRecent();
            break;
        case 'last':
            displayLast();
            break;
        case 'sort':
            sortPlaylist();
            break;
        default:
            break;
    }
    event.target.value = '';
}

// Handle the search input to display relevant results
function handleSearch(event) {
    const query = event.target.value.toLowerCase().trim(); // Trim whitespace and convert to lowercase
    if (!query) {
        console.error('Query is empty or null');
        return;
    }
    const results = songTrie.startsWith(query);
    updateSearchResults(results);
}

// Update the search results
function updateSearchResults(results) {
    const searchResultsElement = document.getElementById('search-results');
    const searchInput = document.getElementById('search'); // Define searchInput here

    if (!searchResultsElement) {
        console.error('Search results element not found');
        return;
    }

    searchResultsElement.innerHTML = '';

    results.forEach(result => {
        // Normalize the result structure
        const normalizedResult = { id: result.song_id || result.id, name: result.song_name || result.name };

        const resultItem = document.createElement('div');
        resultItem.textContent = normalizedResult.name;
        resultItem.addEventListener('click', () => {
            // Check for duplicates in a normalized way
            const isSongInPlaylist = userPlaylist.some(
                song => song.id === normalizedResult.id
            );

            if (!isSongInPlaylist) {
                userPlaylist.push(normalizedResult); // Add to user playlist
                currentSongIndex = userPlaylist.length - 1;
                updateCurrentSong();
                hideSearchResults();
                searchInput.value = normalizedResult.name; // Update search input value
                searchResultsElement.innerHTML = ''; // Clear search results
            } else {
                alert('Song is already in the playlist');
            }
        });

        searchResultsElement.appendChild(resultItem);
    });

    searchResultsElement.style.display = 'block';
}

// function updateSearchResults(results) {
//     const searchResultsElement = document.getElementById('search-results');
//     const searchInput = document.getElementById('search'); // Define searchInput here
//     if (!searchResultsElement) {
//         console.error('Search results element not found');
//         return;
//     }
//     searchResultsElement.innerHTML = '';
//     results.forEach(result => {
//         const resultItem = document.createElement('div');
//         resultItem.textContent = result.name;
//         resultItem.addEventListener('click', () => {
//             if (!userPlaylist.includes(result)) {
//                 userPlaylist.push(result); // Add to user playlist
//                 currentSongIndex = userPlaylist.length - 1;
//                 updateCurrentSong();
//                 hideSearchResults();
//                 searchInput.value = result.name; // Update search input value
//                 searchResultsElement.innerHTML = ''; // Clear search results
//             } else {
//                 alert('Song is already in the playlist');
//             }
//         });
//         searchResultsElement.appendChild(resultItem);
//     });
//     searchResultsElement.style.display = 'block';
// }

// Function to hide search results
function hideSearchResults() {
    const searchResultsElement = document.getElementById('search-results');
    if (searchResultsElement) {
      searchResultsElement.style.display = 'none';
    }
}

// Add a new song to the playlist
function addSong() {
    const songName = prompt('Enter Song Name:');
    const song = universalSource.find(song => song.name.toLowerCase() === songName.toLowerCase());
    if (song && !userPlaylist.includes(song)) {
        userPlaylist.push(song);
        alert('Song Added!');
    } else {
        alert('Song Not Found or Already in Playlist!');
    }
}


// Delete a song from the playlist
function deleteSong() {
    const songName = prompt('Enter Song Name to Delete:');
    if (!songName) {
        alert('Invalid song name entered.');
        return;
    }

    const lowerCaseSongName = songName.toLowerCase();
    const songIndex = userPlaylist.findIndex(song => song.name.toLowerCase() === lowerCaseSongName);

    if (songIndex !== -1) {
        userPlaylist.splice(songIndex, 1);
        alert('Song Deleted!');
        if (currentSongIndex >= userPlaylist.length) {
            currentSongIndex = 0;
        }
        updateCurrentSong();
    } else {
        alert('Song Not Found in Playlist!');
    }
}


// Display the playlist
function displayPlaylist() {
    const playlistNames = userPlaylist.map(song => {
        const songName = song.name ? song.name : song.song_name; 
        return songName;
    });
    alert(playlistNames.join('\n'));
}

function totalSongs() {
    alert(`Total Songs: ${userPlaylist.length}`);
}

// Play a selected song from the playlist
function playSelectedSong() {
    const songName = prompt('Enter Song Name to Play:');
    const songIndex = userPlaylist.findIndex(song => song.name.toLowerCase() === songName.toLowerCase());
    if (songIndex > -1) {
        currentSongIndex = songIndex;
        updateCurrentSong();
    } else {
        alert('Song Not Found in Playlist!');
    }
}

// Display the recently played songs
function displayRecent() {
    alert(recentSongs.map(song => {
        const songName = song.name ? song.name : song.song_name;
        return songName;
    }).join('\n'));
}


// Display the last played song
function displayLast() {
    if (recentSongs.length > 0) {
        const songName = recentSongs[recentSongs.length - 1].name ? recentSongs[recentSongs.length - 1].name : recentSongs[recentSongs.length - 1].song_name;
        alert(`Last Played Song: ${songName}`);
    } else {
        alert('No Last Played Song!');
    }
}

// Sort the playlist alphabetically
function sortPlaylist() {
    userPlaylist.sort((a, b) => {
        const aName = a.name ? a.name : a.song_name; // Ensure aName is properly scoped with const
        const bName = b.name ? b.name : b.song_name; // Ensure bName is properly scoped with const
        return aName.localeCompare(bName); // Return result of localeCompare for proper sorting
    });
    updateCurrentSong();
    alert('Playlist Sorted!');
}

function addToPlaylistAndPlay(song) {
    // Normalize the song structure
    const normalizedSong = { id: song.song_id || song.id, name: song.song_name || song.name };

    // Check for duplicates in a normalized way
    const isSongInPlaylist = userPlaylist.some(
        playlistSong => playlistSong.id === normalizedSong.id
    );

    if (!isSongInPlaylist) {
        userPlaylist.push(normalizedSong); // Add to user playlist
        currentSongIndex = userPlaylist.length - 1;
        updateCurrentSong();
    } else {
        alert('Song is already in the playlist');
    }
}



// function addToPlaylistAndPlay(song) {
//     if ('song_id' in song && 'song_name' in song) {
//         // Convert to the expected structure
//         song = { id: song.song_id, name: song.song_name };
//     }
//     if (!userPlaylist.includes(song)) {
//         userPlaylist.push(song); // Add to user playlist
//         currentSongIndex = userPlaylist.length - 1;
//         updateCurrentSong();
//     } else {
//         alert('Song is already in the playlist');
//     }
// }

// function fetchTrendingSongs() {
//     fetch('/trending-songs')
//         .then(response => response.json())
//         .then(data => {
//             const trendingSongsElement = document.getElementById('trending-songs');
//             trendingSongsElement.innerHTML = '';

//             data.forEach(song => {
//                 const songElement = document.createElement('div');
//                 songElement.classList.add('song-item');

//                 const songImage = document.createElement('img');
//                 songImage.src = `path/to/song/images/${song.song_id}.jpg`; // Update the path accordingly
//                 songImage.alt = `${song.title} cover`;

//                 const songDetails = document.createElement('div');
//                 songDetails.classList.add('song-details');
//                 songDetails.innerHTML = `<strong>${song.title}</strong><br>${song.artist}<br>${song.play_count} plays`;

//                 songElement.appendChild(songImage);
//                 songElement.appendChild(songDetails);

//                 songElement.addEventListener('click', () => {
//                     playSong(song.song_id);
//                 });

//                 trendingSongsElement.appendChild(songElement);
//             });
//         })
//         .catch(error => console.error('Error fetching trending songs:', error));
// }

// // function playSong(songId) {
// //     fetch(`/play-song/${songId}`, { method: 'POST' })
// //         .then(response => response.text())
// //         .then(message => {
// //             console.log(message);
// //             // Code to play the song and add it to the playlist
// //         })
// //         .catch(error => console.error('Error playing song:', error));
// // }

// function playSong(song_id) {
//     fetch('/play-song', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ song_id })
//     })
//     .then(response => response.text())
//     .then(message => {
//         console.log(message);
//         // Additional logic to play the song and add it to the playlist
//     });
// }

// fetchTrendingSongs();
