const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const db = require("../db");

const userAuth = (req, res, next) => {
  try {
    console.log("Cookies Received:", req.cookies);

    const token = req.cookies.token; // Directly access the cookie
    // console.log(token, "tokekfenj");
    if (!token) return res.status(401).json({ success: false, message: "TokenMissing" });

    const decodedMessage = jwt.verify(token, process.env.TOKEN_SECRET);
    console.log(decodedMessage, "Userauth");
    // Querying database with callback
    let sql = "SELECT * FROM users WHERE id = ?";
    db.query(sql, [decodedMessage.id], (error, result) => {
      if (error) return next(error);

      if (result.length === 0) {
        return next(createError.Unauthorized("User does not exist!"));
      }
      // console.log(result, "///////////////////////////////////");
      req.user = decodedMessage.id;
      // console.log(req.user, "]]]]]]]]]]]]]]]]]]]]]]]]");
      next();
    });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(createError.Unauthorized("Invalid token!"));
    }
    if (error.name === "TokenExpiredError") {
      res.clearCookie("token");
      return next(createError.Unauthorized("Token has expired!"));
    }
    next(error);
  }
};

module.exports = userAuth;
