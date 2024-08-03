const { verify } = require("jsonwebtoken");
const { User } = require("../models/User");

const validateToken = async(req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.json({ error: "Authentication header is not provided" });
  }
  const accessToken = header.split("Bearer ")[1];

  if (!accessToken) {
    return res.json({ error: "Authentication Tokens are not provided" });
  } else {
    try {
      const validToken = verify(accessToken, process.env.JWT_TOKEN_SECRET_KEY);
      const userInfo = await User.findById(validToken.user_id);
      req.user = userInfo;
      req.org = userInfo.org;
      // console.log(req.user,req.org);
      console.log(validToken?true:false)
      if (validToken) {
        return next();
      }
    } catch (err) {
      return res.json({ error: err.name });
    }
  }
};
module.exports = { validateToken };
