const FriendRequest = require('../models/FriendRequest');
const User = require('../models/User');
const Profile = require('../models/Profile');

// Send friend request
const sendFriendRequest = async (req, res) => {
  try {
    const { toUsername } = req.body;
    const fromUserId = req.user.userId;

    if (!toUsername) {
      return res.status(400).json({ message: 'Username is required' });
    }

    // Find the target user
    const toUser = await User.findOne({ username: toUsername });
    if (!toUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (toUser._id.toString() === fromUserId) {
      return res.status(400).json({ message: 'You cannot send a friend request to yourself' });
    }

    // Check if already friends
    const fromProfile = await Profile.findOne({ user: fromUserId });
    if (fromProfile?.friends.some(friend => friend.user.toString() === toUser._id.toString())) {
      return res.status(400).json({ message: 'You are already friends with this user' });
    }

    // Check if request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { from: fromUserId, to: toUser._id },
        { from: toUser._id, to: fromUserId }
      ]
    });

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        return res.status(400).json({ message: 'Friend request already sent' });
      } else {
        return res.status(400).json({ message: 'Friend request already processed' });
      }
    }

    // Create new friend request
    const friendRequest = new FriendRequest({
      from: fromUserId,
      to: toUser._id
    });

    await friendRequest.save();

    // Add to recipient's friend requests
    const toProfile = await Profile.findOne({ user: toUser._id });
    if (toProfile) {
      toProfile.friendRequests.push({
        from: fromUserId,
        sentAt: new Date()
      });
      await toProfile.save();
    }

    // Emit socket event for real-time notification
    const socketUtils = require('../socket/socketHandler');
    // This would be handled in the socket handler

    res.status(201).json({
      message: 'Friend request sent successfully',
      friendRequest: {
        id: friendRequest._id,
        from: friendRequest.from,
        to: friendRequest.to,
        status: friendRequest.status,
        sentAt: friendRequest.sentAt
      }
    });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get friend requests
const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user.userId;

    const requests = await FriendRequest.find({ to: userId, status: 'pending' })
      .populate('from', 'username')
      .sort({ sentAt: -1 });

    res.json({
      requests: requests.map(request => ({
        id: request._id,
        from: {
          id: request.from._id,
          username: request.from.username
        },
        sentAt: request.sentAt
      }))
    });
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Respond to friend request
const respondToFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body; // 'accept' or 'decline'
    const userId = req.user.userId;

    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    if (friendRequest.to.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to respond to this request' });
    }

    if (friendRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Friend request already processed' });
    }

    friendRequest.status = action === 'accept' ? 'accepted' : 'declined';
    friendRequest.respondedAt = new Date();
    await friendRequest.save();

    // If accepted, add to both users' friends lists
    if (action === 'accept') {
      const fromProfile = await Profile.findOne({ user: friendRequest.from });
      const toProfile = await Profile.findOne({ user: friendRequest.to });

      if (fromProfile) {
        fromProfile.friends.push({
          user: friendRequest.to,
          addedAt: new Date()
        });
        await fromProfile.save();
      }

      if (toProfile) {
        toProfile.friends.push({
          user: friendRequest.from,
          addedAt: new Date()
        });
        
        // Remove from friend requests
        toProfile.friendRequests = toProfile.friendRequests.filter(
          req => req.from.toString() !== friendRequest.from.toString()
        );
        
        await toProfile.save();
      }
    } else {
      // Remove from friend requests if declined
      const toProfile = await Profile.findOne({ user: friendRequest.to });
      if (toProfile) {
        toProfile.friendRequests = toProfile.friendRequests.filter(
          req => req.from.toString() !== friendRequest.from.toString()
        );
        await toProfile.save();
      }
    }

    res.json({
      message: `Friend request ${action}ed successfully`,
      status: friendRequest.status
    });
  } catch (error) {
    console.error('Respond to friend request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get friends list
const getFriends = async (req, res) => {
  try {
    const userId = req.user.userId;

    const profile = await Profile.findOne({ user: userId })
      .populate('friends.user', 'username')
      .populate('friends.user', 'avatar');

    if (!profile) {
      return res.json({ friends: [] });
    }

    const friends = profile.friends.map(friend => ({
      id: friend.user._id,
      username: friend.user.username,
      avatar: friend.user.avatar,
      addedAt: friend.addedAt,
      online: false // This would be updated by socket.io
    }));

    res.json({ friends });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove friend
const removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user.userId;

    // Remove from both users' friends lists
    const userProfile = await Profile.findOne({ user: userId });
    const friendProfile = await Profile.findOne({ user: friendId });

    if (userProfile) {
      userProfile.friends = userProfile.friends.filter(
        friend => friend.user.toString() !== friendId
      );
      await userProfile.save();
    }

    if (friendProfile) {
      friendProfile.friends = friendProfile.friends.filter(
        friend => friend.user.toString() !== userId
      );
      await friendProfile.save();
    }

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search users
const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user.userId;

    if (!query || query.length < 2) {
      return res.status(400).json({ message: 'Query must be at least 2 characters' });
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: userId } },
        { username: { $regex: query, $options: 'i' } }
      ]
    }).select('username').limit(10);

    // Check which users are already friends
    const userProfile = await Profile.findOne({ user: userId });
    const friendIds = userProfile?.friends.map(f => f.user.toString()) || [];

    const results = users.map(user => ({
      id: user._id,
      username: user.username,
      isFriend: friendIds.includes(user._id.toString())
    }));

    res.json({ users: results });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  sendFriendRequest,
  getFriendRequests,
  respondToFriendRequest,
  getFriends,
  removeFriend,
  searchUsers
};
