/* eslint-disable no-undef */
// Import the 'connection' from dbconfig.js
const connection = require('./dbconfig');

// Récupérer les messages d'une chatroom
const getMessagesByChatroomId = (chatroomId) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM messages WHERE chatroom_id = ?';
    connection.query(query, [chatroomId], (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

module.exports = {
  getMessagesByChatroomId,
};
