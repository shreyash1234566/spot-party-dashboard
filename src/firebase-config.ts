import app from "./firebase";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const messaging = getMessaging(app);

export { messaging, getToken, onMessage };