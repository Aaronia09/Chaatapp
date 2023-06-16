/* eslint-disable no-undef */
const connection = require('./dbconfig');

// Récupérer les informations d'un administrateur par son email
const getAdminByEmail = (email) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM administrators WHERE email = ?';
    connection.query(query, [email], (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result[0]);
      }
    });
  });
};

module.exports = {
  getAdminByEmail,
};
