const checkPermission = (requiredPermission) => {
    return (req, res, next) => {
      // Vérifiez si l'utilisateur a la permission requise
      if (req.auth.permissions && req.user.permissions.includes(requiredPermission)) {
        next(); // L'utilisateur a la permission, passez au middleware suivant
      } else {
        res.status(403).json({ message: "Vous n'êtes pas autorisé à accéder à cette ressource." });
      }
    };
  };