const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());
app.use('/styles', express.static(path.join(__dirname, 'styles')));
app.use('/scripts', express.static(path.join(__dirname, 'scripts')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/icon', express.static(path.join(__dirname, 'icon')));


const usersFilePath = path.join(__dirname, 'data/users.json');
console.log(usersFilePath);
const readUsersFromFile = () => {
    try {
        const data = fs.readFileSync(usersFilePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
};


const writeUsersToFile = (users) => {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
};
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/styles/stylesheet1.css', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'styles', 'stylesheet1.css'));
});

app.get('/scripts/script.js', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'scripts', 'script.js'));
});

app.get('/images/templogo.png', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'images', 'templogo.png'));
});

app.get('/icon/site.webmanifest', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'icon', 'site.webmanifest'));
});


app.post('/signup', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  console.log('Received signup request for:', username);

  fs.readFile(USERS_FILE, (err, data) => {
      if (err) {
          console.error('Error reading users file:', err);
          return res.status(500).json({ message: 'Internal server error' });
      }

      const users = JSON.parse(data);
      if (users[username]) {
          console.log('User already exists:', username);
          return res.status(400).json({ message: 'User already exists' });
      }

      users[username] = { password };
      fs.writeFile(USERS_FILE, JSON.stringify(users), (err) => {
          if (err) {
              console.error('Error writing to users file:', err);
              return res.status(500).json({ message: 'Internal server error' });
          }
          console.log('User registered successfully:', username);
          res.status(200).json({ message: 'User registered successfully' });
      });
  });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const users = readUsersFromFile();
        const user = users.find(user => user.username === username);
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ username: user.username }, 'secretkey', { expiresIn: '1h' });
        res.json({ token });
        res.redirect('/login')
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
    
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
