export interface IDestination {
  getTitle: () => string;
  getSubtitle: () => string;
  getKey: () => string;
  getConversationTitle: () => string;
}
