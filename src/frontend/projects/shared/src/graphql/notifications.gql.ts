import { gql } from 'apollo-angular';

export const MY_NOTIFICATIONS = gql`
  query MyNotifications {
    myNotifications {
      id
      kind
      title
      body
      readAt
      createdAt
    }
  }
`;

export const MARK_AS_READ = gql`
  mutation MarkAsRead($id: ID!) {
    markAsRead(id: $id) {
      id
      readAt
    }
  }
`;

export type NotifKind = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

export interface NotificationDto {
  id: string;
  kind: NotifKind;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}
