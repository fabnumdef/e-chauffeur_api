import mongoose from 'mongoose';
import webPush from 'web-push';
import createdAtPlugin from './helpers/created-at';
import config from '../services/config';
import { NOTIFICATION_DEVICE_COLLECTION_NAME, NOTIFICATION_DEVICE_MODEL_NAME } from './helpers/constants';

const { Schema } = mongoose;

const NotificationDeviceSchema = new Schema({
  user: {
    _id: { type: mongoose.Types.ObjectId, alias: 'user.id' },
  },
  endpoint: {
    type: String,
    required: true,
  },
  keys: {
    p256dh: {
      type: String,
      required: true,
    },
    auth: {
      type: String,
      required: true,
    },
  },
});

NotificationDeviceSchema.plugin(createdAtPlugin);

NotificationDeviceSchema.index({ 'user._id': 1 });

NotificationDeviceSchema.statics.findOneByUser = async function findOneByUser(userId) {
  return this.findOne({ 'user._id': userId });
};

NotificationDeviceSchema.statics.findOneAndUpdateByUser = async function findOneAndUpdateByUser(body) {
  return this.findOneAndUpdate({ 'user._id': body.user._id }, body, { upsert: true });
};

NotificationDeviceSchema.methods.notify = async function notify(payload = {}) {
  const vapidPublicKey = config.get('vapid:public_key');
  const vapidPrivateKey = config.get('vapid:private_key');

  const options = {
    vapidDetails: {
      subject: `mailto:${config.get('mail:feedback_mail')}`,
      publicKey: vapidPublicKey,
      privateKey: vapidPrivateKey,
    },
    TTL: 3600,
  };

  return webPush.sendNotification(
    {
      endpoint: this.endpoint,
      keys: this.keys,
    },
    JSON.stringify(payload),
    options,
  );
};

export default mongoose.model(
  NOTIFICATION_DEVICE_MODEL_NAME,
  NotificationDeviceSchema,
  NOTIFICATION_DEVICE_COLLECTION_NAME,
);
