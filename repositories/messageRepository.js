/* eslint-disable no-undef */
const connection = require('./dbconfig');

// Créer un nouveau message
const createMessage = (message) => {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO messages SET ?';
    connection.query(query, message, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

// Lire un message par son ID
const getMessageById = (messageId) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM messages WHERE id = ?';
    connection.query(query, [messageId], (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result[0]);
      }
    });
  });
};

// Mettre à jour un message
const updateMessage = (messageId, updatedMessage) => {
  return new Promise((resolve, reject) => {
    const query = 'UPDATE messages SET ? WHERE id = ?';
    connection.query(query, [updatedMessage, messageId], (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

// Supprimer un message
const deleteMessage = (messageId) => {
  return new Promise((resolve, reject) => {
    const query = 'DELETE FROM messages WHERE id = ?';
    connection.query(query, [messageId], (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

module.exports = {
  createMessage,
  getMessageById,
  updateMessage,
  deleteMessage,
};
