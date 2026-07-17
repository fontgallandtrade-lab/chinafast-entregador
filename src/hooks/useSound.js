import { Audio } from 'expo-av';
import { useState } from 'react';

export function useSound() {
  const [sound, setSound] = useState(null);

  const playNewDeliverySound = async () => {
    try {
      // Usar som padrão do sistema ou arquivo local
      const { sound: newSound } = await Audio.Sound.createAsync(
        require('../assets/sounds/new-delivery.mp3'),
        { shouldPlay: true }
      );
      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      console.log('Erro ao tocar som:', error);
      // Fallback: usar som padrão do sistema
    }
  };

  const playCouponSound = async () => {
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        require('../assets/sounds/coupon.mp3'),
        { shouldPlay: true }
      );
      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      console.log('Erro ao tocar som:', error);
    }
  };

  const unloadSound = async () => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }
  };

  return { 
    playNewDeliverySound, 
    playCouponSound,
    unloadSound,
  };
}

export default useSound;
