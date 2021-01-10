const jwt = require("jsonwebtoken");

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, process.env.SECRET_KEY, (err, decodedToken) => {
      if (err) {
        // console.log(err.message);
        res.redirect("/signin");
      } else {
        // console.log(decodedToken);
        next();
      }
    });
  } else {
    res.redirect("/signin");
  }
};

module.exports = requireAuth;
