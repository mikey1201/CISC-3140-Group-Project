const express = require('express');
const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require('bcrypt');
const fs = require('fs');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const port = 3000;

// Fetch files from default directory
app.use(express.static(path.join(__dirname, '..')));

app.use(express.json());

// Start the database
mongoose.connect('mongodb://localhost:27017/data');

app.use(session({
    secret: 'cisc3140secretkey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

const db = mongoose.connection;

// User schema for database
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    lists: {
        loveIt: [{ type: String }],
        okay: [{ type: String }],
        hatedIt: [{ type: String }]
    },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    extract: { type: String }
});

const User = mongoose.model("User", userSchema);
const Movie = mongoose.model("Movie", movieSchema);

// Route to get all movies
app.get('/api/movies', async (req, res) => {
    try {
        const movies = await findAllMovies();
        res.json(movies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Registration Route
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            password: hashedPassword,
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Login Route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log('Received login request for:', username);

        const user = await User.findOne({ username });
        if (!user) {
            console.log('No user found with username:', username);
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Password mismatch for user:', username);
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        console.log('User authenticated successfully:', username);
        req.session.userId = user._id;

        // Redirect to the dashboard page after successful login
        res.status(200).json({ message: 'Login successful', redirectUrl: '/' });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});
app.get('/session-status', (req, res) => {
    if (req.session.userId) {
        res.json({ loggedIn: true });
    } else {
        res.json({ loggedIn: false });
    }
});
// Middleware to ensure the user is authenticated before accessing the dashboard
const authenticate = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    } else {
        return res.redirect('/'); // Redirect to the home page or another valid route
    }
};


// Example of a protected route
app.get('/api/protected-route', authenticate, (req, res) => {
    res.json({ message: 'You have access to this route' });
});

// Route to get user info
app.get('/api/user-info', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ username: user.username, createdAt: user.createdAt, lists: user.lists });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Route to replace the user's movie lists
app.post('/api/user/lists', authenticate, async (req, res) => {
    const { loveIt, okay, hatedIt } = req.body;

    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update only the lists that were provided
        if (loveIt) user.lists.loveIt = loveIt;
        if (okay) user.lists.okay = okay;
        if (hatedIt) user.lists.hatedIt = hatedIt;

        await user.save();
        res.status(200).json({ message: 'User lists updated successfully', lists: user.lists });
    } catch (error) {
        console.error('Error while updating lists:', error.message); // Log server-side errors
        res.status(500).json({ message: 'Server error while updating lists', error: error.message });
    }
});

// Logout Route
app.post('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed' });
        }
        res.clearCookie('connect.sid'); // Assuming you're using express-session
        res.status(200).json({ message: 'Logout successful' });
    });
});
// Start the server
app.listen(port, async () => {
    console.log(`Server running on http://localhost:${port}`);
    await loadMoviesIntoDatabase();
});

// Helper function to find all movies
async function findAllMovies() {
    try {
        return await Movie.find();
    } catch (error) {
        console.error('Error finding movies:', error.message);
        throw error;
    }
}

// Helper function to load movies into the database
async function loadMoviesIntoDatabase() {
    const filePath = path.join(__dirname, '..', 'data', 'movies.json');

    if (!fs.existsSync(filePath)) {
        console.log('movies.json file does not exist.');
        return;
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const movies = JSON.parse(fileContent);

    const movieCount = await Movie.countDocuments();
    if (movieCount > 0) {
        console.log('Movies are already loaded into the database.');
        return;
    }

    try {
        await Movie.insertMany(movies);
        console.log('Movies loaded into the database successfully.');
    } catch (error) {
        console.error('Error loading movies into the database:', error);
    }
}

app.get('/api/profile', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId).populate('friends', 'username');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            username: user.username,
            lists: user.lists,  
            friends: user.friends
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/add-friend', authenticate, async (req, res) => {
    const { friendId } = req.body; // assuming userId is from session and friendId is in the request body

    if (!friendId) {
        return res.status(400).json({ message: 'Friend ID is required' });
    }

    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.friends.includes(friendId)) {
            return res.status(400).json({ message: 'Friend already added' });
        }

        user.friends.push(friendId);
        await user.save();

        res.status(200).json({ message: 'Friend added successfully' });
    } catch (error) {
        console.error('Error adding friend:', error);
        res.status(500).json({ message: 'Server error while adding friend' });
    }
});


app.get('/api/search-users', async (req, res) => {
    const { name } = req.query;
    if (!name) {
        return res.status(400).json({ error: 'Name query parameter is required' });
    }

    try {
        const users = await User.find({ username: new RegExp(name, 'i') }); 
        console.log(users);
        res.json({ users });
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get('/api/friends', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId).populate('friends', 'username');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ friends: user.friends });
    } catch (err) {
        console.error('Error fetching friends:', err);
        res.status(500).json({ message: 'Server error' });
    }
});


app.get('/api/friends-movie-lists', authenticate, async (req, res) => {
    const friendName = req.query.name;
    console.log(friendName);
    try {
        const friend = await User.findOne({ username: friendName }).select('lists');
        if (!friend) {
            return res.status(404).json({ message: 'Friend not found' });
        }

        res.json({ lists: friend.lists });
    } catch (error) {
        console.error('Error fetching friend\'s movie list:', error);
        res.status(500).json({ message: 'Server error while fetching friend\'s movie list' });
    }
});
