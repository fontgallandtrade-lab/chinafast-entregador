import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function registerForPushNotifications() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    return null;
  }
  
  const token = await Notifications.getExpoPushTokenAsync();
  return token;
}

export function scheduleDeliveryNotification(delivery) {
  Notifications.scheduleNotificationAsync({
    content: {
      title: '📱 Nova Corrida!',
      body: `${delivery?.distance || '2.5'} km - R$ ${delivery?.value || '15,00'}`,
      data: { deliveryId: delivery?.id },
    },
    trigger: null,
  });
}

export default {
  registerForPushNotifications,
  scheduleDeliveryNotification,
};
