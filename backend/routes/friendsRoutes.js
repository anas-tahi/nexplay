const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  sendFriendRequest,
  getFriendRequests,
  respondToFriendRequest,
  getFriends,
  removeFriend,
  searchUsers
} = require('../controllers/friendsController');

// Send friend request
router.post('/request', authenticateToken, sendFriendRequest);

// Get friend requests
router.get('/requests', authenticateToken, getFriendRequests);

// Respond to friend request
router.put('/requests/:requestId', authenticateToken, respondToFriendRequest);

// Get friends list
router.get('/', authenticateToken, getFriends);

// Remove friend
router.delete('/:friendId', authenticateToken, removeFriend);

// Search users
router.get('/search', authenticateToken, searchUsers);

module.exports = router;
