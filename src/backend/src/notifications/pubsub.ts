import { PubSub } from 'graphql-subscriptions';

export const NOTIFICATION_ADDED = 'notificationAdded';

/** PubSub singleton in-memory — para prod distribuída, trocar por Redis ou SQS adapter. */
export const pubsub = new PubSub();
