
/* eslint-disable no-undef */
const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');

// Route d'inscription
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Vérifier si l'utilisateur existe déjà dans la base de données
    const query = 'SELECT * FROM users WHERE email = ?';
    connection.query(query, [email], async (error, results) => {
      if (error) {
        return res.status(500).json({ message: 'Une erreur est survenue lors de l\'inscription' });
      }

      if (results.length > 0) {
        return res.status(400).json({ message: 'Cet utilisateur existe déjà' });
      }

      // Hasher le mot de passe avant de le sauvegarder dans la base de données
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insérer le nouvel utilisateur dans la base de données
      const insertQuery = 'INSERT INTO users (email, password) VALUES (?, ?)';
      connection.query(insertQuery, [email, hashedPassword], (error) => {
        if (error) {
          return res.status(500).json({ message: 'Une erreur est survenue lors de l\'inscription' });
        }

        res.json({ message: 'Inscription réussie' });
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Une erreur est survenue lors de l\'inscription' });
  }
});

// Route de connexion
router.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({ message: 'Connexion réussie' });
});

// Route de déconnexion
router.get('/logout', (req, res) => {
  req.logout();
  res.json({ message: 'Déconnexion réussie' });
});

module.exports = router;
