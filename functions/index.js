// functions/index.js

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

admin.initializeApp();

const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

const validateInput = (data) => {
  const errors = [];
  if (!data.title?.trim()) errors.push("Title is required.");
  if (!data.body?.trim()) errors.push("Body is required.");
  if (!data.date?.trim()) errors.push("Date is required.");
  if (!data.receiver?.trim()) errors.push("Receiver is required.");
  if (!data.notificationType?.trim()) errors.push("Notification type is required.");

  if (data.title && data.title.length > 100) errors.push("Title must be 100 characters or less.");
  if (data.body && data.body.length > 500) errors.push("Body must be 500 characters or less.");
  if (data.imageUrl && !isValidUrl(data.imageUrl)) errors.push("Image URL must be a valid URL.");
  if (!["promotional", "normal"].includes(data.notificationType)) errors.push("Type must be 'promotional' or 'normal'.");
  if (!["all", "specific", "manual"].includes(data.receiver)) errors.push("Receiver must be 'all', 'specific', or 'manual'.");

  // Tokens are only required if the receiver is NOT 'all'
  if (data.receiver !== 'all') {
    if (!Array.isArray(data.fcmTokens) || data.fcmTokens.length === 0) {
      errors.push("FCM tokens are required for specific/manual sends.");
    }
    if (data.fcmTokens?.length > 500) {
      errors.push("Maximum 500 FCM tokens allowed per request.");
    }
  }

  return errors;
};

exports.sendNotification = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      if (req.method !== "POST") {
        return res.status(405).json({ success: false, error: "Method not allowed." });
      }

      const {
        title, body, date, imageUrl, receiver, notificationType, fcmTokens,
        priority = "high", sound = "default", data: customData = {}
      } = req.body;
      
      const validationErrors = validateInput(req.body);
      if (validationErrors.length > 0) {
        return res.status(400).json({ success: false, error: "Validation failed", details: validationErrors });
      }

      // --- Build the common message payload ---
      const notificationPayload = { title: title.trim(), body: body.trim() };
      const dataPayload = {
        ...customData, sender: "admin", receiver, notificationType,
        date, originalTitle: title.trim(), timestamp: Date.now().toString(),
        clickAction: "FLUTTER_NOTIFICATION_CLICK"
      };

      const baseMessage = {
        notification: notificationPayload,
        data: dataPayload,
        android: {
          priority,
          notification: {
            sound, clickAction: "FLUTTER_NOTIFICATION_CLICK",
            channelId: notificationType === "promotional" ? "promotional_channel" : "normal_channel"
          }
        },
        apns: {
          headers: { "apns-priority": priority === "high" ? "10" : "5" },
          payload: { aps: { sound, badge: 1, "mutable-content": 1 } }
        },
        webpush: {
          headers: { Urgency: priority },
          notification: { requireInteraction: priority === "high" }
        }
      };

      if (imageUrl?.trim()) {
        const cleanImageUrl = imageUrl.trim();
        baseMessage.android.notification.imageUrl = cleanImageUrl;
        baseMessage.apns.fcm_options = { image: cleanImageUrl };
        baseMessage.webpush.notification.image = cleanImageUrl;
        baseMessage.data.imageUrl = cleanImageUrl;
      }

      // --- Branch sending logic based on receiver type ---
      if (receiver === 'all') {
        const topic = 'all_users';
        const topicMessage = { ...baseMessage, topic };
        
        console.log(`Sending notification to topic: ${topic}`);
        const response = await admin.messaging().send(topicMessage);
        
        return res.status(200).json({
          success: true,
          message: `Notification sent to topic '${topic}'.`,
          details: { messageId: response }
        });

      } else {
        const validTokens = fcmTokens.filter(t => t?.trim());
        if (validTokens.length === 0) {
          return res.status(400).json({ success: false, error: "No valid FCM tokens provided." });
        }
        
        console.log(`Sending notification to ${validTokens.length} specific tokens.`);
        const response = await admin.messaging().sendToDevice(validTokens, baseMessage);
        
        const successCount = response.successCount;
        const failureCount = response.failureCount;
        const failedTokensInfo = [];

        if (failureCount > 0) {
          response.results.forEach((result, index) => {
            if (!result.error) return;
            failedTokensInfo.push({
              token: validTokens[index].substring(0, 20) + "...",
              error: result.error.code
            });
          });
        }
        
        return res.status(200).json({
          success: true,
          message: `Processed ${validTokens.length} tokens.`,
          details: { totalTokens: validTokens.length, successCount, failureCount, failedTokens: failedTokensInfo }
        });
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      return res.status(500).json({ success: false, error: "Internal server error", message: error.message });
    }
  });
});