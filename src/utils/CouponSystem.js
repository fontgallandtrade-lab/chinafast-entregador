import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const COUPON_KEY = '@chinafast:coupon';
const USED_COUPONS_KEY = '@chinafast:used_coupons';

export class CouponSystem {
  
  static async validateCoupon(couponCode) {
    try {
      const coupon = await this.getTodayCoupon();
      if (!coupon) {
        return { 
          valid: false, 
          message: '❌ Cupom não encontrado' 
        };
      }

      if (coupon.code !== couponCode) {
        return { 
          valid: false, 
          message: '❌ Código inválido' 
        };
      }

      if (coupon.status === 'used') {
        return { 
          valid: false, 
          message: '❌ Este cupom já foi utilizado' 
        };
      }

      const today = new Date().toDateString();
      if (coupon.date !== today) {
        return { 
          valid: false, 
          message: '❌ Cupom expirado (data inválida)' 
        };
      }

      const now = new Date();
      const expires = new Date(coupon.expiresAt);
      if (now > expires) {
        await AsyncStorage.removeItem(COUPON_KEY);
        return { 
          valid: false, 
          message: '⏰ Cupom expirado! Válido apenas até 13h' 
        };
      }

      const driverId = await AsyncStorage.getItem('@chinafast:driver_id');
      if (coupon.driverId && coupon.driverId !== driverId) {
        return { 
          valid: false, 
          message: '❌ Cupom não pertence a este entregador' 
        };
      }

      return {
        valid: true,
        message: '✅ Cupom válido!',
        coupon: coupon,
      };
    } catch (error) {
      console.log('Erro na validação:', error);
      return { 
        valid: false, 
        message: '❌ Erro ao validar cupom' 
      };
    }
  }

  static async generateCouponOnOnline(driverId) {
    try {
      const today = new Date();
      const hour = today.getHours();
      
      if (hour >= 13) {
        return { 
          generated: false, 
          message: '⏰ Período de geração encerrado (apenas até 13h)' 
        };
      }
      
      const existing = await this.getTodayCoupon();
      if (existing) {
        const validation = await this.validateCoupon(existing.code);
        if (validation.valid) {
          return { 
            generated: false, 
            message: '✅ Você já possui um cupom válido hoje!', 
            coupon: existing 
          };
        } else {
          await AsyncStorage.removeItem(COUPON_KEY);
        }
      }
      
      const couponCode = this.generateSecureCouponCode(driverId);
      const expiresAt = this.getExpirationTime();
      
      const coupon = {
        code: couponCode,
        date: today.toDateString(),
        expiresAt: expiresAt,
        value: 10.00,
        restaurant: 'Dellys Lanches',
        status: 'active',
        driverId: driverId || 'unknown',
        generatedAt: today.toISOString(),
        hash: this.generateHash(couponCode, driverId),
        securityVersion: '2.0',
      };
      
      await AsyncStorage.setItem(COUPON_KEY, JSON.stringify(coupon));
      
      return {
        generated: true,
        message: '🍱 Marmitex R$ 10,00 gerado! Válido até 13h no Dellys Lanches.',
        coupon: coupon,
      };
    } catch (error) {
      console.log('Erro ao gerar cupom:', error);
      return {
        generated: false,
        message: '❌ Erro ao gerar cupom',
      };
    }
  }

  static generateSecureCouponCode(driverId) {
    const today = new Date();
    const date = today.toISOString().slice(0,10).replace(/-/g, '');
    const driverHash = this.simpleHash(driverId || 'unknown');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const time = today.getHours().toString().padStart(2, '0') + 
                 today.getMinutes().toString().padStart(2, '0');
    
    return `MARMI-${date}-${driverHash}-${random}-${time}`;
  }

  static simpleHash(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36).substring(0, 6).toUpperCase();
  }

  static generateHash(code, driverId) {
    const data = `${code}-${driverId}-${new Date().toDateString()}`;
    return this.simpleHash(data);
  }

  static getExpirationTime() {
    const today = new Date();
    today.setHours(13, 0, 0, 0);
    return today.toISOString();
  }

  static async getTodayCoupon() {
    try {
      const data = await AsyncStorage.getItem(COUPON_KEY);
      if (!data) return null;
      
      const coupon = JSON.parse(data);
      const today = new Date().toDateString();
      
      if (coupon.date !== today) {
        return null;
      }
      
      return coupon;
    } catch (error) {
      console.log('Erro ao buscar cupom:', error);
      return null;
    }
  }

  static async useCoupon(couponCode) {
    try {
      const validation = await this.validateCoupon(couponCode);
      if (!validation.valid) {
        return { 
          success: false, 
          message: validation.message 
        };
      }

      const coupon = validation.coupon;
      coupon.status = 'used';
      coupon.usedAt = new Date().toISOString();
      await AsyncStorage.setItem(COUPON_KEY, JSON.stringify(coupon));

      await this.registerUsedCoupon(coupon);

      return { 
        success: true, 
        message: '🍱 Cupom utilizado com sucesso no Dellys Lanches!',
        coupon: coupon,
      };
    } catch (error) {
      console.log('Erro ao usar cupom:', error);
      return { 
        success: false, 
        message: '❌ Erro ao usar cupom' 
      };
    }
  }

  static async registerUsedCoupon(coupon) {
    try {
      const data = await AsyncStorage.getItem(USED_COUPONS_KEY);
      const usedCoupons = data ? JSON.parse(data) : [];
      usedCoupons.push({
        code: coupon.code,
        usedAt: coupon.usedAt,
        driverId: coupon.driverId,
      });
      await AsyncStorage.setItem(USED_COUPONS_KEY, JSON.stringify(usedCoupons));
    } catch (error) {
      console.log('Erro ao registrar cupom usado:', error);
    }
  }

  static getTimeUntilExpiration() {
    const now = new Date();
    const expires = new Date();
    expires.setHours(13, 0, 0, 0);
    
    if (now > expires) return '⚠️ Cupom expirado';
    
    const diff = expires - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `⏰ Expira em ${hours}h${minutes}min`;
  }

  static isCouponAvailable() {
    const now = new Date();
    const hour = now.getHours();
    return hour < 13;
  }

  static async blockCoupon(couponCode) {
    try {
      const coupon = await this.getTodayCoupon();
      if (coupon && coupon.code === couponCode) {
        coupon.status = 'blocked';
        await AsyncStorage.setItem(COUPON_KEY, JSON.stringify(coupon));
        return { success: true, message: '🔒 Cupom bloqueado por segurança' };
      }
      return { success: false, message: '❌ Cupom não encontrado' };
    } catch (error) {
      return { success: false, message: '❌ Erro ao bloquear cupom' };
    }
  }

  static async cleanExpiredCoupons() {
    try {
      const coupon = await this.getTodayCoupon();
      if (coupon) {
        const now = new Date();
        const expires = new Date(coupon.expiresAt);
        if (now > expires) {
          await AsyncStorage.removeItem(COUPON_KEY);
          return { cleaned: true, message: '🧹 Cupom expirado removido' };
        }
      }
      return { cleaned: false, message: '✅ Nenhum cupom para limpar' };
    } catch (error) {
      console.log('Erro ao limpar cupons:', error);
      return { cleaned: false, message: '❌ Erro ao limpar' };
    }
  }
}
