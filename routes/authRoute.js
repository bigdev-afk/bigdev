import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userSchema.js';
import Profile from '../models/profileSchema.js';
import { logout } from '../middleware/auth.js';

const router = express.Router();

// =================== SIGNUP ===================
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashedPassword });
    await user.save();

    // Create profile automatically
    const profile = new Profile({
      user: user._id,
      name: user.name,
      title: 'New User',
      bio: 'This is my bio',
      location: 'Unknown',
      website: '',
      github: '',
      twitter: '',
      linkedin: '',
      settings: {
        profileVisibility: 'public',
        emailPreferences: {
          newsletter: true,
          jobOpportunities: true,
          productUpdates: false
        }
      }
    });
    await profile.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// =================== LOGIN ===================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// =================== LOGOUT ===================
router.post('/logout', (req, res) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(400).json({ msg: 'No token provided' });

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    logout(token);
    res.json({ msg: 'Logged out successfully' });
  } catch (err) {
    res.status(400).json({ msg: 'Invalid token' });
  }
});

export default router;
