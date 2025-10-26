/**
 * Service for managing conversation data and metadata
 */

/**
 * Updates metadata for a specific conversation
 * @param conversationId - The ID of the conversation to update
 * @param metadata - The metadata object to merge with existing metadata
 * @returns Promise with the updated conversation data
 */
export async function updateConversationMetadata(
  conversationId: string,
  metadata: Record<string, any>
): Promise<{
  success: boolean;
  conversation_id: string;
  metadata: Record<string, any>;
  data: any;
}> {
  const response = await fetch("/api/update-conversation-metadata", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      conversation_id: conversationId,
      metadata,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error || "Failed to update conversation metadata"
    );
  }

  return response.json();
}

/**
 * Fetches all conversations from ElevenLabs and syncs them to the database
 * @returns Promise with the list of conversations
 */
export async function fetchAndSyncConversations(): Promise<{
  conversations: any[];
}> {
  const response = await fetch("/api/fetch-conversations");

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch conversations");
  }

  return response.json();
}
