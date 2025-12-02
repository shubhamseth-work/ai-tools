// import dotenv from 'dotenv';
// dotenv.config();
import { PubSub } from '@google-cloud/pubsub';
const pubsub = new PubSub();

const sendMsgAlerts = async (req, res) => {
  try {
    const inputMessage = req.body?.message || req.query?.message || 'Hello from Project B';
    const TOPIC_NAME = process.env.SEND_ALERT_TOPIC;
    const dataBuffer = Buffer.from(
      JSON.stringify({
        text: inputMessage,
        ts: Date.now()
      })
    );
    const messageId = await pubsub.topic(TOPIC_NAME).publish(dataBuffer);
    console.log(`Message ${messageId} published.`);
    return messageId;
  } catch (err) {
    console.error('Error publishing to Pub/Sub:', err);
    return err.message;
  }
}


export { sendMsgAlerts };
