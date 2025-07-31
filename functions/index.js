const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

// Initialize Firebase Admin SDK
admin.initializeApp();

// Simple ping function for deployment confirmation
exports.ping = functions.https.onRequest((req, res) => {
  console.log("Ping function invoked!");
  res.send("pong");
});

// Helper function to validate URL
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Helper function to validate input
const validateInput = (data) => {
  const errors = [];

  // Required fields validation
  if (!data.title || typeof data.title !== "string" || !data.title.trim()) {
    errors.push("Title is required and must be a non-empty string");
  }
  if (!data.body || typeof data.body !== "string" || !data.body.trim()) {
    errors.push("Body is required and must be a non-empty string");
  }
  if (!data.date || typeof data.date !== "string" || !data.date.trim()) {
    errors.push("Date is required and must be a non-empty string");
  }
  if (!data.receiver || typeof data.receiver !== "string" || !data.receiver.trim()) {
    errors.push("Receiver is required (all/specific)");
  }
  if (!data.notificationType || typeof data.notificationType !== "string" || !data.notificationType.trim()) {
    errors.push("Notification type is required (promotional/normal)");
  }

  // Length validations
  if (data.title && data.title.length > 100) {
    errors.push("Title must be 100 characters or less");
  }
  if (data.body && data.body.length > 500) {
    errors.push("Body must be 500 characters or less");
  }

  // Image URL validation
  if (data.imageUrl && (!isValidUrl(data.imageUrl) || data.imageUrl.length > 2000)) {
    errors.push("Image URL must be a valid URL and less than 2000 characters");
  }

  // FCM tokens validation
  if (!data.fcmTokens || !Array.isArray(data.fcmTokens) || data.fcmTokens.length === 0) {
    errors.push("FCM tokens are required and must be a non-empty array");
  }
  if (data.fcmTokens && data.fcmTokens.length > 500) {
    errors.push("Maximum 500 FCM tokens allowed per request");
  }

  // Notification type validation
  if (data.notificationType && !["promotional", "normal"].includes(data.notificationType.toLowerCase())) {
    errors.push("Notification type must be either 'promotional' or 'normal'");
  }

  // Receiver type validation
  if (data.receiver && !["all", "specific"].includes(data.receiver.toLowerCase())) {
    errors.push("Receiver must be either 'all' or 'specific'");
  }

  return errors;
};

// Push notification function
exports.sendNotification = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      // Log request details for debugging
      console.log("=== NOTIFICATION REQUEST START ===");
      console.log("Method:", req.method);
      console.log("Body:", JSON.stringify(req.body, null, 2));

      // Only allow POST requests
      if (req.method !== "POST") {
        return res.status(405).json({ 
          success: false, 
          error: "Method not allowed. Use POST method." 
        });
      }

      // Extract data from request body
      const {
        title,
        body,
        date,
        imageUrl,
        receiver = "all",
        notificationType = "normal",
        fcmTokens = [],
        priority = "high",
        sound = "default",
        data: customData = {}
      } = req.body;

      // Validate input
      const validationErrors = validateInput({
        title,
        body,
        date,
        imageUrl,
        receiver,
        notificationType,
        fcmTokens
      });

      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: validationErrors
        });
      }

      // Filter valid tokens
      const validTokens = fcmTokens.filter(token => 
        token && typeof token === "string" && token.trim().length > 0
      );

      if (validTokens.length === 0) {
        return res.status(400).json({
          success: false,
          error: "No valid FCM tokens provided"
        });
      }

      // Build notification payload
      const notificationPayload = {
        title: `${date} - ${title.trim()}`,
        body: body.trim()
      };

      // Build data payload
      const dataPayload = {
        ...customData,
        sender: "admin",
        receiver: receiver.toLowerCase(),
        notificationType: notificationType.toLowerCase(),
        date: date.trim(),
        originalTitle: title.trim(),
        timestamp: Date.now().toString(),
        clickAction: "FLUTTER_NOTIFICATION_CLICK"
      };

      // Build base message without tokens
      const baseMessage = {
        notification: notificationPayload,
        data: dataPayload,
        android: {
          priority: priority,
          notification: {
            sound: sound,
            clickAction: "FLUTTER_NOTIFICATION_CLICK",
            channelId: notificationType.toLowerCase() === "promotional" 
              ? "promotional_channel" 
              : "normal_channel"
          }
        },
        apns: {
          headers: {
            "apns-priority": priority === "high" ? "10" : "5"
          },
          payload: {
            aps: {
              sound: sound,
              badge: 1,
              "mutable-content": 1
            }
          }
        },
        webpush: {
          headers: {
            Urgency: priority === "high" ? "high" : "normal"
          },
          notification: {
            requireInteraction: priority === "high"
          }
        }
      };

      // Add image if provided
      if (imageUrl && imageUrl.trim()) {
        const cleanImageUrl = imageUrl.trim();
        baseMessage.android.notification.imageUrl = cleanImageUrl;
        baseMessage.apns.fcm_options = { image: cleanImageUrl };
        baseMessage.webpush.notification.image = cleanImageUrl;
        baseMessage.data.imageUrl = cleanImageUrl;
      }

      // Send notifications with concurrency control
      const concurrencyLimit = 10;
      const sendPromises = [];
      const failedTokens = [];

      for (let i = 0; i < validTokens.length; i++) {
        const token = validTokens[i];
        const message = { ...baseMessage, token };
        
        if (sendPromises.length >= concurrencyLimit) {
          await Promise.all(sendPromises.splice(0, concurrencyLimit));
        }

        const sendPromise = admin.messaging().send(message)
          .then(() => ({ success: true, token }))
          .catch(error => {
            console.error(`Failed to send to token: ${token.substring(0, 20)}...`, error);
            return { success: false, token, error };
          });
        
        sendPromises.push(sendPromise);
      }

      // Process remaining promises
      const results = await Promise.all(sendPromises);
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      // Prepare failed tokens info
      results.filter(r => !r.success).forEach(({ token, error }) => {
        failedTokens.push({
          token: token.substring(0, 20) + "...",
          error: error.code || "unknown_error"
        });
      });

      console.log(`Notification sent: ${successCount} success, ${failureCount} failures`);

      // Return success response
      return res.status(200).json({
        success: true,
        message: "Notification processing complete",
        details: {
          totalTokens: validTokens.length,
          successCount,
          failureCount,
          failedTokens,
          hasImage: !!(imageUrl && imageUrl.trim())
        }
      });

    } catch (error) {
      console.error("Error sending notifications:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to send notification",
        code: error.code || "internal_error",
        message: error.message || "An unexpected error occurred"
      });
    }
  });
});