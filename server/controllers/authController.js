const jwt = require('jsonwebtoken');
const User = require('../modeles/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// @route POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {

  try {

    

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');


    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }


    const isMatch = await user.matchPassword(password);


    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user._id);

res.json({

  success: true,

  token,

  user: {

    _id: user._id,

    name: user.name,

    email: user.email,

    avatar: user.avatar

  }

});

  } catch (error) {

    console.log(error);

    next(error);

  }

};

// @route GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// @route GET /api/auth/search?q=email
exports.searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, users: [] });

    const users = await User.find({
      $or: [
        { email: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } },
      ],
      _id: { $ne: req.user._id },
    }).select('name email avatar').limit(10);

    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};