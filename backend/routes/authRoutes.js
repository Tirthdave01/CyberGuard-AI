import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { readData, writeData } from '../services/storage.js';
import { validateRegistration, validateLogin } from '../middleware/validate.js';
import { verifyToken, requireRole, JWT_SECRET } from '../middleware/auth.js';
import { recordSecurityLog } from '../middleware/logger.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', validateRegistration, async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;
    const users = readData('users');

    const existingUser = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists in system records.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      id: uuidv4(),
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: role && ['admin', 'analyst'].includes(role) ? role : 'analyst',
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    writeData('users', users);

    recordSecurityLog({
      user: newUser.username,
      action: 'USER_REGISTERED',
      description: `New user account created with role: ${newUser.role}`,
      ip: req.ip
    });

    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password: _, ...safeUser } = newUser;

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      token,
      user: safeUser
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', validateLogin, async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const users = readData('users');

    const user = users.find(
      (u) =>
        u.username.toLowerCase() === username.toLowerCase() ||
        u.email.toLowerCase() === username.toLowerCase()
    );

    if (!user) {
      recordSecurityLog({
        user: username,
        action: 'LOGIN_FAILURE',
        description: 'Failed login attempt - user not found',
        ip: req.ip
      });
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      recordSecurityLog({
        user: username,
        action: 'LOGIN_FAILURE',
        description: 'Failed login attempt - incorrect password',
        ip: req.ip
      });
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    recordSecurityLog({
      user: user.username,
      action: 'LOGIN_SUCCESS',
      description: `Successful login session initiated for role: ${user.role}`,
      ip: req.ip
    });

    const { password: _, ...safeUser } = user;

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: safeUser
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me (Protected)
router.get('/me', verifyToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

// GET /api/auth/users (Protected: Admin only)
router.get('/users', verifyToken, requireRole(['admin']), (req, res) => {
  const users = readData('users');
  const safeUsers = users.map(({ password, ...u }) => u);
  res.json({ success: true, count: safeUsers.length, users: safeUsers });
});

export default router;
