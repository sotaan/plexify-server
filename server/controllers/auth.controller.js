import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import config from '../../config/config';
import passport from "passport";


const generateJWT = (user) => {
  const today = new Date();
  let exp = new Date(today);
  exp.setDate(today.getDate() + 60);
  exp = parseInt(exp.getTime() / 1000)

  return jwt.sign({
    username: user.username,
    exp
  }, config.jwtSecret);
}

const makeAuthError = (err) => new APIError(err, httpStatus.UNAUTHORIZED, true);

/**
 * Returns jwt token if valid username and password is provided
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
const login = (req, res, next) => {
  passport.authenticate('local', { session: false }, function (err, user, info) {
    if (err) { return next(makeAuthError(err)); }

    if (user) {
      const token = generateJWT(user);
      return res.json({
        token,
        username: user.username
      });
    } else {
      return next(makeAuthError('Authentication error: ' + info));
    }
  })(req, res, next);
}

/**
 * This is a protected route. Will return random number only if jwt token is provided in header.
 * @param req
 * @param res
 * @returns {*}
 */
const getRandomNumber = (req, res) => {
  // req.user is assigned by jwt middleware if valid token is provided
  return res.json({
    user: req.user,
    num: Math.random() * 100
  });
}

export default { login, getRandomNumber, generateJWT };
