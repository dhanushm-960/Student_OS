import Notification from "../models/Notification.js";
import User from "../models/User.js";

// Helper to format date as relative string
function formatRelativeTime(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

// @desc    Get student's notifications (targeted and broadcasts)
// @route   GET /api/student/notifications
// @access  Private
export const getStudentNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { student: req.user._id },
        { student: null } // Global broadcasts
      ]
    }).sort({ createdAt: -1 });

    const mapped = notifications.map(n => ({
      id: n._id.toString(),
      title: n.title,
      type: n.type,
      unread: n.unread,
      time: formatRelativeTime(n.createdAt)
    }));

    res.json({
      success: true,
      notifications: mapped
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle notification unread status
// @route   POST /api/student/notifications/:id/toggle-read
// @access  Private
export const toggleReadNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      res.status(404);
      throw new Error("Notification not found.");
    }

    notification.unread = !notification.unread;
    await notification.save();

    res.json({
      success: true,
      notification: {
        id: notification._id.toString(),
        unread: notification.unread
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   POST /api/student/notifications/read-all
// @access  Private
export const markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      {
        $or: [
          { student: req.user._id },
          { student: null }
        ]
      },
      { unread: false }
    );

    res.json({
      success: true,
      message: "All notifications marked as read."
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new notification (Admin)
// @route   POST /api/admin/notifications
// @access  Private/Admin
export const createAdminNotification = async (req, res, next) => {
  try {
    const { studentId, title, type } = req.body;
    if (!title) {
      res.status(400);
      throw new Error("Notification title is required.");
    }

    // Verify student exists if specified
    if (studentId) {
      const studentExists = await User.findById(studentId);
      if (!studentExists) {
        res.status(404);
        throw new Error("Target student user not found.");
      }
    }

    const notification = await Notification.create({
      student: studentId || null, // null means broadcast to all
      title,
      type: type || "system",
      unread: true
    });

    res.status(201).json({
      success: true,
      message: "Notification sent successfully.",
      notification
    });
  } catch (error) {
    next(error);
  }
};
