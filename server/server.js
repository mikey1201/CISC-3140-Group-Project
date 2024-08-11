const express = require('express');
const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require('bcrypt');
const fs = require('fs');

const app = express();
const port = 3000;

//fetch files from default directory
app.use(express.static(path.join(__dirname, '..')));

app.use(express.json());
//start the database
mongoose.connect('mongodb://localhost:27017/data');

const db = mongoose.connection;

//user schema for database
const userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true, trim: true,},
    password: {type: String, required: true,},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
});
const movieSchema = new mongoose.Schema({
    title: {type: String, required: true},
    extract: {type: String}
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
        // Check if the username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Hash the password before saving it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
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
        // Find the user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const authenticate = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    } else {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};
app.get('/api/protected-route', authenticate, (req, res) => {
    res.json({ message: 'You have access to this route' });
});

const bodyParser = require('body-parser');
const session = require('express-session');

app.use(bodyParser.json());
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
}));

//start the server
app.listen(port, async () => {
    console.log(`Server running on http://localhost:${port}`);
    // Load movies into the database
    await loadMoviesIntoDatabase();
});
async function findAllMovies(){
    try {
        return await Movie.find();
    } catch (error) {
        console.error(error.message);
    }
}

async function loadMoviesIntoDatabase() {
    const filePath = path.join(__dirname, '..', 'data', 'movies.json');

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
        console.log('movies.json file does not exist.');
        return;
    }

    // Read the file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const movies = JSON.parse(fileContent);

    // Check if the database already contains movies
    const movieCount = await Movie.countDocuments();
    if (movieCount > 0) {
        console.log('Movies are already loaded into the database.');
        return;
    }

    // Load movies into the database
    try {
        await Movie.insertMany(movies);
        console.log('Movies loaded into the database successfully.');
    } catch (error) {
        console.error('Error loading movies into the database:', error);
    }
}