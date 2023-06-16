/* eslint-disable no-undef */
const connection = require('./dbconfig');

// Créer une nouvelle chatroom
const createChatroom = (chatroom) => {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO chatrooms SET ?';
    connection.query(query, chatroom, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

// Lire une chatroom par son ID
const getChatroomById = (chatroomId) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM chatrooms WHERE id = ?';
    connection.query(query, [chatroomId], (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result[0]);
      }
    });
  });
};

// Mettre à jour une chatroom
const updateChatroom = (chatroomId, updatedChatroom) => {
  return new Promise((resolve, reject) => {
    const query = 'UPDATE chatrooms SET ? WHERE id = ?';
    connection.query(query, [updatedChatroom, chatroomId], (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

// Supprimer une chatroom
const deleteChatroom = (chatroomId) => {
  return new Promise((resolve, reject) => {
    const query = 'DELETE FROM chatrooms WHERE id = ?';
    connection.query(query, [chatroomId], (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

// eslint-disable-next-line no-undef
module.exports = {
  createChatroom,
  getChatroomById,
  updateChatroom,
  deleteChatroom,
};
