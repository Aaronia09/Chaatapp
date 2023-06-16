/* eslint-disable no-unused-vars */
const authMiddleware = (req, res, next) => {
  // Vérifier si l'utilisateur est authentifié
  if (req.session && req.session.userId) {
    // Utilisateur authentifié

    // Vérifier le rôle de l'utilisateur
    if (req.session.role === 'admin') {
      // L'utilisateur est un administrateur, passer à la prochaine étape
      next();
    } else {
      // L'utilisateur n'a pas les autorisations d'administrateur, rediriger vers une page d'erreur ou afficher un message d'erreur
      res.status(403).send('Accès interdit');
    }
  } else {
    // Utilisateur non authentifié, rediriger vers la page de connexion
    res.redirect('/login');
  }
};
