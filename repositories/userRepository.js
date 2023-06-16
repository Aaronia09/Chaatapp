// userRepository.js
import { query as _query } from './dbconfig';

// Créer un nouvel utilisateur
const createUser = (user) => {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO users SET ?';
    _query(query, user, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

// Lire un utilisateur par son ID
const getUserById = (userId) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM users WHERE id = ?';
    _query(query, [userId], (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result[0]);
      }
    });
  });
};

// Mettre à jour un utilisateur
const updateUser = (userId, updatedUser) => {
  return new Promise((resolve, reject) => {
    const query = 'UPDATE users SET ? WHERE id = ?';
    _query(query, [updatedUser, userId], (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

// Supprimer un utilisateur
const deleteUser = (userId) => {
  return new Promise((resolve, reject) => {
    const query = 'DELETE FROM users WHERE id = ?';
    _query(query, [userId], (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

export default {
  createUser,
  getUserById,
  updateUser,
  deleteUser,
};
