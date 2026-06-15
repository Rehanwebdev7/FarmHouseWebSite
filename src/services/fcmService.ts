import { toast } from "sonner";

/**
 * FCM Service Stub
 * Hook this service to real Firebase SDK credentials once they are ready.
 */
export const fcmService = {
  /**
   * Request push notification permissions and retrieve the device registration token
   */
  requestPermissionAndGetToken: async (): Promise<string | null> => {
    try {
      console.log("[FCM] Requesting notification permission...");
      
      // Request permission using browser Notification API
      if (!("Notification" in window)) {
        console.warn("[FCM] Push notifications not supported in this browser environment.");
        return null;
      }
      
      const permission = await Notification.requestPermission();
      
      if (permission === "granted") {
        console.log("[FCM] Notification permission authorized by user.");
        
        // Mock FCM Registration Token
        const mockToken = "fcm_token_" + Math.random().toString(36).substring(2, 18) + "_" + Date.now();
        console.log("[FCM] Token acquired:", mockToken);
        
        return mockToken;
      } else {
        console.warn("[FCM] Notification permission denied.");
        return null;
      }
    } catch (error) {
      console.error("[FCM] Error requesting token:", error);
      return null;
    }
  },

  /**
   * Listen for incoming messages when the app is in the foreground
   */
  onMessageListener: (callback: (payload: { title: string; body: string }) => void) => {
    console.log("[FCM] Registered foreground message listener.");
    
    // Listen for custom mock FCM trigger event
    const eventHandler = (e: Event) => {
      const customEvent = e as CustomEvent<{ title: string; body: string }>;
      if (customEvent.detail) {
        callback(customEvent.detail);
      }
    };
    
    window.addEventListener("fcm-mock-message", eventHandler);
    
    // Return unsubscribe function
    return () => {
      window.removeEventListener("fcm-mock-message", eventHandler);
    };
  },

  /**
   * Simulate a mock push notification arrival (FCM payload simulation)
   */
  simulateIncomingNotification: (title: string, body: string) => {
    console.log("[FCM] Simulating incoming push request:", { title, body });
    
    // Dispatch custom event
    const event = new CustomEvent("fcm-mock-message", {
      detail: { title, body }
    });
    window.dispatchEvent(event);
    
    // Display premium toast notification
    toast.info(title, {
      description: body,
      duration: 5000,
    });
  }
};

export default fcmService;
