/* eslint-disable no-undef */
const express = require('express');
const app = express();
const session = require('express-session');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');


// Configuration de la connexion à la base de données MySQL
const mysql = require('mysql');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'visit',
});

// Connexion à la base de données
connection.connect((error) => {
  if (error) {
    console.error('Erreur de connexion à la base de données:', error);
  } else {
    console.log('Connecté à la base de données MySQL');
  }
});

// Middleware pour parser le corps des requêtes en JSON
app.use(express.json());


const secretKey = crypto.randomBytes(64).toString('hex');
console.log('Clé secrète générée:', secretKey);

const userPayload = {
  role: 'user',
  userId: '123456789',
};

// Création des données à inclure dans le token pour un administrateur de salle de discussion
const adminPayload = {
  role: 'administrator',
  userId: '987654321',
};
const userToken = jwt.sign(userPayload, secretKey);

console.log('Token utilisateur généré:', userToken);

// Génération du token pour l'administrateur en utilisant la clé secrète
const adminToken = jwt.sign(adminPayload, secretKey);

console.log('Token administrateur généré:', adminToken);

// Configuration du middleware express-session
app.use(
  session({
    secret: secretKey,
    resave: false,
    saveUninitialized: false,
  })
);

// Configuration de la stratégie d'authentification locale
passport.use(
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' },
    async (email, password, done) => {
      try {
        const query = 'SELECT * FROM users WHERE username =? AND email = ? AND password = ?';
        connection.query(query, [username, email,password], async (error, results) => {
          if (error) {
            return done(error);
          }

          if (results.length === 0) {
            return done(null, false, { message: 'Identifiants invalides' });
          }

          const user = results[0];

          const isPasswordValid = await bcrypt.compare(
            password,
            user.password
          );

          if (!isPasswordValid) {
            return done(null, false, { message: 'Identifiants invalides' });
          }

          return done(null, user);
        });
      } catch (error) {
        return done(error);
      }
    }
  )
);



// Middleware d'initialisation de Passport
app.use(passport.initialize());
app.use(passport.session());

// Middleware pour vérifier l'authentification de l'utilisateur
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    // Ajouter l'en-tête d'autorisation à la requête
    req.headers.authorization = `Bearer ${userToken}`;
    return next();
  }

  res.status(401).json({ message: 'Authentification impossible' });
}


// Socket.IO - Communication en temps réel
io.on('connection', (socket) => {
  console.log('Un utilisateur s\'est connecté');

  socket.on('disconnect', () => {
    console.log('Un utilisateur s\'est déconnecté');
  });
});

// Route pour la création de chatroom
app.post('/chatrooms', ensureAuthenticated, (req, res) => {
  req.headers.authorization = `Bearer ${userToken}`;

  const { name } = req.body;

  // Vérifier si une chatroom avec le même nom existe déjà dans la base de données
  const query = 'SELECT * FROM chatrooms WHERE name = ?';
  connection.query(query, [name], (error, results) => {
    if (error) {
      return res.status(500).json({ message: 'Une erreur est survenue lors de la création de la chatroom' });
    }
    if (results.length > 0) {
      return res
        .status(400)
        .json({ message: 'Une chatroom avec ce nom existe déjà' });
    }

    // Créer la nouvelle chatroom dans la base de données
    const insertQuery = 'INSERT INTO chatrooms (name) VALUES (?)';
    connection.query(insertQuery, [name], (error) => {
      if (error) {
        return res
          .status(500)
          .json({ message: 'Une erreur est survenue lors de la création de la chatroom' });
      }

      res.json({ message: 'Chatroom créée avec succès' });
    });
  });
});

// Route pour la recherche des chatrooms
app.get('/chatrooms/search', ensureAuthenticated, (req, res) => {
  req.headers.authorization = `Bearer ${userToken}`;

  const { query } = req.query;

  // Rechercher les chatrooms dont le nom correspond à la requête de recherche
  const searchQuery = 'SELECT * FROM chatrooms WHERE name LIKE ?';
  connection.query(searchQuery, [`%${query}%`], (error, results) => {
    if (error) {
      return res
        .status(500)
        .json({ message: 'Une erreur est survenue lors de la recherche des chatrooms' });
    }

    res.json(results);
  });
});

// Route pour la liste des chatrooms
app.get('/chatrooms', ensureAuthenticated, (req, res) => {
  req.headers.authorization = `Bearer ${userToken}`;

  // Récupérer toutes les chatrooms de la base de données
  const getAllQuery = 'SELECT * FROM chatrooms';
  connection.query(getAllQuery, (error, results) => {
    if (error) {
      return res
        .status(500)
        .json({ message: 'Une erreur est survenue lors de la récupération des chatrooms' });
    }

    res.json(results);
  });
});

// Route pour la récupération des messages d'une chatroom
app.get('/chatrooms/:id/messages', ensureAuthenticated, (req, res) => {
  req.headers.authorization = `Bearer ${userToken}`;

  const { id } = req.params;

  // Récupérer les messages de la chatroom depuis la base de données
  const getMessagesQuery = 'SELECT * FROM messages WHERE chatroom_id = ?';
  connection.query(getMessagesQuery, [id], (error, results) => {
    if (error) {
      return res
        .status(500)
        .json({ message: 'Une erreur est survenue lors de la récupération des messages' });
    }

    res.json(results);
  });
});

// Route pour rejoindre une chatroom en tant qu'administrateur
app.post('/chatrooms/:id/join', ensureAuthenticated, (req, res) => {
  req.headers.authorization = `Bearer ${userToken}`;

  const { id } = req.params;
  const userId = req.user.id;

  // Vérifier si l'utilisateur est déjà membre de la chatroom
  const checkMembershipQuery =
    'SELECT * FROM chatroom_members WHERE chatroom_id = ? AND user_id = ?';
  connection.query(checkMembershipQuery, [id, userId], (error, results) => {
    if (error) {
      return res.status(500).json({
        message:
          'Une erreur est survenue lors de la vérification de l\'appartenance à la chatroom',
      });
    }

    if (results.length > 0) {
      return res
        .status(400)
        .json({ message: 'Vous êtes déjà membre de cette chatroom' });
    }

    // Ajouter l'utilisateur en tant que membre de la chatroom avec le rôle d'administrateur
    const addMembershipQuery =
      'INSERT INTO chatroom_members (chatroom_id, user_id, role) VALUES (?, ?, "admin")';
    connection.query(addMembershipQuery, [id, userId], (error) => {
      if (error) {
        return res.status(500).json({
          message:
            'Une erreur est survenue lors de l\'ajout de l\'utilisateur à la chatroom',
        });
      }

      res.json({
        message: 'Vous avez rejoint la chatroom en tant qu\'administrateur',
      });
    });
  });
});

// Route pour rejoindre une chatroom en tant que membre
app.post('/chatrooms/:id/members', ensureAuthenticated, (req, res) => {
  req.headers.authorization = `Bearer ${userToken}`;

  const { id } = req.params;
  const userId = req.user.id;

  // Vérifier si l'utilisateur est déjà membre de la chatroom
  const checkMembershipQuery =
    'SELECT * FROM chatroom_members WHERE chatroom_id = ? AND user_id = ?';
  connection.query(checkMembershipQuery, [id, userId], (error, results) => {
    if (error) {
      return res.status(500).json({
        message:
          'Une erreur est survenue lors de la vérification de l\'appartenance à la chatroom',
      });
    }

    if (results.length > 0) {
      return res
        .status(400)
        .json({ message: 'Vous êtes déjà membre de cette chatroom' });
    }

    // Ajouter l'utilisateur en tant que membre de la chatroom avec le rôle de membre
    const addMembershipQuery =
      'INSERT INTO chatroom_members (chatroom_id, user_id, role) VALUES (?, ?, "member")';
    connection.query(addMembershipQuery, [id, userId], (error) => {
      if (error) {
        return res.status(500).json({
          message:
            'Une erreur est survenue lors de l\'ajout de l\'utilisateur à la chatroom',
        });
      }

      res.json({ message: 'Vous avez rejoint la chatroom en tant que membre' });
    });
  });
});

// Route pour l'envoi d'un message dans une chatroom
app.post('/chatrooms/:id/messages', ensureAuthenticated, (req, res) => {
  req.headers.authorization = `Bearer ${userToken}`;

  const { id } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  // Vérifier si l'utilisateur est membre de la chatroom
  const checkMembershipQuery =
    'SELECT * FROM chatroom_members WHERE chatroom_id = ? AND user_id = ?';
  connection.query(checkMembershipQuery, [id, userId], (error, results) => {
    if (error) {
      return res.status(500).json({
        message:
          'Une erreur est survenue lors de la vérification de l\'appartenance à la chatroom',
      });
    }

    if (results.length === 0) {
      return res.status(400).json({
        message: 'Vous ne pouvez pas envoyer de message dans cette chatroom',
      });
    }

    // Insérer le message dans la base de données
    const insertMessageQuery =
      'INSERT INTO messages (chatroom_id, user_id, content) VALUES (?, ?, ?)';
    connection.query(
      insertMessageQuery,
      [id, userId, content],
      (error) => {
        if (error) {
          return res.status(500).json({
            message: 'Une erreur est survenue lors de l\'envoi du message',
          });
        }

        // Émettre le message aux autres utilisateurs connectés à la chatroom
        io.to(id).emit('message', { user_id: userId, content });

        res.json({ message: 'Message envoyé avec succès' });
      }
    );
  });
});

// Route pour la connexion de l'utilisateur
app.post('/login', (req, res, next) => {
  passport.authenticate('local', (error, user, info) => {
    if (error) {
      return next(error);
    }

    if (!user) {
      return res.status(400).json({ message: info.message });
    }

    req.login(user, (error) => {
      if (error) {
        return next(error);
      }

      res.json({ message: 'Authentification réussie' });
    });
  })(req, res, next);
});

// Route pour la déconnexion de l'utilisateur
app.post('/logout', ensureAuthenticated, (req, res) => {
  req.logout();
  res.json({ message: 'Déconnexion réussie' });
});

// Route pour l'inscription de l'utilisateur
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Vérification des infos
  const checkEmailQuery = 'SELECT * FROM users WHERE username = ? AND email = ? AND password = ?';
connection.query(checkEmailQuery, [username, email, password], async (error, results) => {
  if (error) {
    return res.status(500).json({ message: "Une erreur est survenue lors de la vérification de vos informations " });
  }

  if (results.length > 0) {
    return res.status(400).json({ message: 'Impossible,l\'utilisateur existe déjà' });
  }

 



    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insérer l'utilisateur dans la base de données
    const insertUserQuery =
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    connection.query(
      insertUserQuery,
      [username, email, hashedPassword],
      (error) => {
        if (error) {
          return res.status(500).json({ message: 'Une erreur est survenue lors de l\'inscription' });
        }

        res.json({ message: 'Inscription réussie' });
      }
    );
  });
});

// Route pour la récupération des informations de l'utilisateur connecté
app.get('/user', ensureAuthenticated, (req, res) => {
  const { id, username, email ,password } = req.user;
  res.json({ id, username, email,password });
});



// Lancement du serveur HTTP
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Serveur HTTP lancé sur le port ${PORT}`);
});

