// functions/index.js

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

// Initialize Firebase Admin SDK
admin.initializeApp();

// ============================================================================
// Helper Functions
// ============================================================================

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


// ============================================================================
// Main Send Notification Function
// ============================================================================

exports.sendNotification = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      console.log("=== NOTIFICATION REQUEST START ===");
      console.log("Method:", req.method);
      console.log("Body:", JSON.stringify(req.body, null, 2));

      if (req.method !== "POST") {
        return res.status(405).json({ success: false, error: "Method not allowed." });
      }
      
      const {
        title, body, date, imageUrl, receiver, notificationType, fcmTokens = [],
        priority = "high", sound = "default", data: customData = {}
      } = req.body;
      
      const validationErrors = validateInput(req.body);
      if (validationErrors.length > 0) {
        console.log('Validation errors:', validationErrors);
        return res.status(400).json({ success: false, error: "Validation failed", details: validationErrors });
      }

      // --- Build the common message structure ---
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

      // --- BRANCH 1: Send to 'all' users via topic (from second file) ---
      if (receiver === 'all') {
        const topic = 'all_users';
        const topicMessage = { ...baseMessage, topic };
        
        console.log(`Sending notification to topic: ${topic}`);
        const response = await admin.messaging().send(topicMessage);
        console.log('Topic send response:', response);
        
        return res.status(200).json({
          success: true,
          message: `Notification sent to topic '${topic}'.`,
          details: { messageId: response }
        });
      } 
      // --- BRANCH 2: Send to 'specific'/'manual' users one-by-one (from first file) ---
      else {
        const validTokens = fcmTokens.filter(token => token && typeof token === "string" && token.trim().length > 0);
        
        if (validTokens.length === 0) {
            return res.status(400).json({ success: false, error: "No valid FCM tokens provided in the list." });
        }

        console.log(`Sending to ${validTokens.length} tokens one-by-one.`);

        const concurrencyLimit = 10; // Send in batches of 10 to avoid overwhelming resources
        let sendPromises = [];
        const results = [];

        for (const token of validTokens) {
            const message = { ...baseMessage, token };

            // Create a promise for sending a single message
            const sendPromise = admin.messaging().send(message)
                .then(() => ({ success: true, token }))
                .catch(error => {
                    console.error(`Failed to send to token: ${token.substring(0, 20)}...`, error.code);
                    return { success: false, token, error };
                });
            
            sendPromises.push(sendPromise);

            // If the batch is full, wait for it to complete
            if (sendPromises.length >= concurrencyLimit) {
                const batchResults = await Promise.all(sendPromises);
                results.push(...batchResults);
                sendPromises = []; // Reset for the next batch
            }
        }
        
        // Wait for any remaining promises in the last batch
        if (sendPromises.length > 0) {
            const batchResults = await Promise.all(sendPromises);
            results.push(...batchResults);
        }

        // Process the results
        const successCount = results.filter(r => r.success).length;
        const failureCount = results.filter(r => !r.success).length;
        const failedTokensInfo = results
          .filter(r => !r.success)
          .map(({ token, error }) => ({
            token: token.substring(0, 20) + "...",
            error: error.code || "unknown_error",
            message: error.message || "An unknown error occurred"
          }));

        console.log(`Notification processing complete: ${successCount} success, ${failureCount} failures.`);

        return res.status(200).json({
            success: true,
            message: "Notification processing complete.",
            details: {
                totalTokens: validTokens.length,
                successCount,
                failureCount,
                failedTokens: failedTokensInfo
            }
        });
      }
    } catch (error) {
      // --- Generic error handler for any unexpected issues ---
      console.error("Critical error in sendNotification function:", error);
      return res.status(500).json({ 
        success: false, 
        error: "Internal server error", 
        message: error.message,
        details: {
          code: error.code,
          errorInfo: error.errorInfo
        }
      });
    }
  });
});