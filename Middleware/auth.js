const jwt = require("jsonwebtoken");
const secretKey = process.env.SECRET_KEY || "mysecret"; // Moved to environment variable

exports.auth = async (req, res, next) => {
  try {
    const authHeader = req.header("authorization");
    if (!authHeader) {
      return res.status(401).send("Authorization header missing");
    }
    const authToken = authHeader.split(" ")[1];
    // console.log(authToken);

    const user = jwt.verify(authToken, secretKey);
    console.log(user);
    // console.log(token);
    next();
  } catch (err) {
    console.log(err);
    res.status(500).send("Token Invalid");
  }
};
