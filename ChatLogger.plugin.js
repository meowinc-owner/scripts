// filename: ChatLogger.plugin.js
import { before } from "@vendetta/patcher";
import { getMessage } from "@vendetta/entities";
import { storage } from "@vendetta/plugin";
import { findByProps } from "@vendetta/metro";

// Save messages here
storage.loggedMessages = storage.loggedMessages || [];

let unpatch;

export default {
  onLoad() {
    const messageEvents = findByProps("sendMessage", "receiveMessage");

    unpatch = before("receiveMessage", messageEvents, (args) => {
      const [channelId, message] = args;
      if (!message || !message.content) return;

      storage.loggedMessages.push({
        channelId,
        author: message.author?.username,
        content: message.content,
        timestamp: new Date().toISOString(),
      });

      // Optional: Keep log size manageable
      if (storage.loggedMessages.length > 1000) {
        storage.loggedMessages.shift(); // remove oldest
      }
    });
  },

  onUnload() {
    unpatch?.();
  },

  // Optional settings tab
  settings: {
    view() {
      return (
        <ScrollView>
          <Text>Logged {storage.loggedMessages.length} messages.</Text>
        </ScrollView>
      );
    }
  }
};
