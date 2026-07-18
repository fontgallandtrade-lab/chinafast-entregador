export function useSound() {
  const playNewDeliverySound = async () => {
    console.log('Nova entrega recebida');
  };

  const playCouponSound = async () => {
    console.log('Cupom recebido');
  };

  const unloadSound = async () => {};

  return {
    playNewDeliverySound,
    playCouponSound,
    unloadSound,
  };
}

export default useSound;
