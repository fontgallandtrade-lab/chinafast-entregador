import AsyncStorage from '@react-native-async-storage/async-storage';

const COUPON_KEY = '@chinafast:coupon';
const USED_COUPONS_KEY = '@chinafast:used_coupons';

export class CouponSystem {
  
  // 🔍 VALIDAR CUPOM - VERIFICA TODAS AS REGRAS
  static async validateCoupon(couponCode) {
    try {
      const coupon = await this.getTodayCoupon();
      if (!coupon) {
        return { valid: false, message: '❌ Cupom não encontrado' };
      }

      if (coupon.code !== couponCode) {
        return { valid: false, message: '❌ Código inválido' };
      }

      // ❌ JÁ FOI USADO?
      if (coupon.status === 'used') {
        return { valid: false, message: '❌ Este cupom já foi utilizado' };
      }

      // 📅 É DO MESMO DIA?
      const today = new Date().toDateString();
      if (coupon.date !== today) {
        return { valid: false, message: '❌ Cupom expirado (data inválida)' };
      }

      // ⏰ AINDA ESTÁ DENTRO DO HORÁRIO? (13:00)
      const now = new Date();
      const expires = new Date(coupon.expiresAt);
      if (now > expires) {
        await AsyncStorage.removeItem(COUPON_KEY);
        return { valid: false, message: '⏰ Cupom expirado! Válido apenas até 13h' };
      }

      return { valid: true, message: '✅ Cupom válido!', coupon: coupon };
    } catch (error) {
      return { valid: false, message: '❌ Erro ao validar cupom' };
    }
  }

  // 🎯 GERAR CUPOM - SÓ SE FOR ANTES DAS 13H E NÃO TIVER CUPOM HOJE
  static async generateCouponOnOnline(driverId) {
    try {
      const today = new Date();
      const hour = today.getHours();
      
      // ⏰ SÓ GERA SE FOR ANTES DAS 13H
      if (hour >= 13) {
        return { 
          generated: false, 
          message: '⏰ Período de geração encerrado (apenas até 13h)' 
        };
      }
      
      // 📅 VERIFICA SE JÁ TEM CUPOM HOJE
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
          // Se expirou, remove e gera novo
          await AsyncStorage.removeItem(COUPON_KEY);
        }
      }
      
      // 🔢 GERAR CÓDIGO ÚNICO
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
      };
      
      await AsyncStorage.setItem(COUPON_KEY, JSON.stringify(coupon));
      
      return {
        generated: true,
        message: '🍱 Marmitex R$ 10,00 gerado! Válido até 13h no Dellys Lanches.',
        coupon: coupon,
      };
    } catch (error) {
      return { generated: false, message: '❌ Erro ao gerar cupom' };
    }
  }

  // 🔢 GERAR CÓDIGO COM DATA
  static generateSecureCouponCode(driverId) {
    const today = new Date();
    const date = today.toISOString().slice(0,10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const hash = this.simpleHash(driverId || 'unknown').substring(0, 6);
    return `MARMI-${date}-${hash}-${random}`;
  }

  static simpleHash(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36).toUpperCase();
  }

  // ⏰ EXPIRA ÀS 13:00 DO MESMO DIA
  static getExpirationTime() {
    const today = new Date();
    today.setHours(13, 0, 0, 0);
    return today.toISOString();
  }

  // 🔍 BUSCAR CUPOM DO DIA (SÓ O DE HOJE)
  static async getTodayCoupon() {
    try {
      const data = await AsyncStorage.getItem(COUPON_KEY);
      if (!data) return null;
      
      const coupon = JSON.parse(data);
      const today = new Date().toDateString();
      
      // Se não for de hoje, ignorar
      if (coupon.date !== today) {
        return null;
      }
      
      // Se já passou das 13h, ignorar
      const now = new Date();
      const expires = new Date(coupon.expiresAt);
      if (now > expires && coupon.status === 'active') {
        coupon.status = 'expired';
        await AsyncStorage.setItem(COUPON_KEY, JSON.stringify(coupon));
        return null;
      }
      
      return coupon;
    } catch (error) {
      return null;
    }
  }

  // 🍽️ USAR CUPOM - MARCA COMO USADO
  static async useCoupon(couponCode) {
    try {
      const validation = await this.validateCoupon(couponCode);
      if (!validation.valid) {
        return { success: false, message: validation.message };
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
      return { success: false, message: '❌ Erro ao usar cupom' };
    }
  }

  // 📝 REGISTRAR CUPOM USADO (HISTÓRICO)
  static async registerUsedCoupon(coupon) {
    try {
      const data = await AsyncStorage.getItem(USED_COUPONS_KEY);
      const usedCoupons = data ? JSON.parse(data) : [];
      usedCoupons.push({
        code: coupon.code,
        usedAt: coupon.usedAt || new Date().toISOString(),
        driverId: coupon.driverId,
        date: coupon.date,
      });
      await AsyncStorage.setItem(USED_COUPONS_KEY, JSON.stringify(usedCoupons));
    } catch (error) {}
  }

  // ⏰ TEMPO RESTANTE PARA EXPIRAR
  static getTimeUntilExpiration() {
    const now = new Date();
    const expires = new Date();
    expires.setHours(13, 0, 0, 0);
    
    if (now > expires) return '⚠️ Cupom expirado';
    
    const diff = expires - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `⏰ Expira em ${hours}h${minutes}min`;
    }
    return `⏰ Expira em ${minutes}min`;
  }

  // 🔍 VERIFICAR SE PODE GERAR CUPOM
  static isCouponAvailable() {
    const now = new Date();
    return now.getHours() < 13;
  }

  // 🧹 LIMPAR CUPONS EXPIRADOS
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
      return { cleaned: false, message: '❌ Erro ao limpar' };
    }
  }
}
