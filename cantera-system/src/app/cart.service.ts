import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CartItem {
  productId: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen: string;
}

export interface Cart {
  items: CartItem[];
  shippingMethod: 'recogida' | 'envio';
  shippingZone?: 'local' | 'regional' | 'nacional';
  subtotal: number;
  discount: number;
  discountPercentage: number;
  shippingCost: number;
  total: number;
}

export interface DiscountRule {
  minQuantity: number;
  maxQuantity: number | null;
  percentage: number;
  label: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly STORAGE_KEY = 'cantera_cart';
  private readonly DISCOUNT_RULES: DiscountRule[] = [
    { minQuantity: 1, maxQuantity: 4, percentage: 0, label: 'Menudeo (1-4 piezas)' },
    { minQuantity: 5, maxQuantity: 9, percentage: 5, label: 'Intermedio (5-9 piezas)' },
    { minQuantity: 10, maxQuantity: null, percentage: 10, label: 'Mayoreo (10+ piezas)' }
  ];

  private readonly SHIPPING_COSTS = {
    local: 150,
    regional: 300,
    nacional: 500
  };

  private cartSubject = new BehaviorSubject<Cart>(this.getInitialCart());
  public cart$ = this.cartSubject.asObservable();

  constructor() {
    this.loadCart();
  }

  private getInitialCart(): Cart {
    return {
      items: [],
      shippingMethod: 'recogida',
      subtotal: 0,
      discount: 0,
      discountPercentage: 0,
      shippingCost: 0,
      total: 0
    };
  }

  private loadCart(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const cart = JSON.parse(stored);
        this.cartSubject.next(cart);
      } catch (e) {
        console.error('Error loading cart:', e);
        this.clearCart();
      }
    }
  }

  private saveCart(cart: Cart): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
  }

  private calculateTotals(cart: Cart): Cart {
    // Calcular subtotal
    const subtotal = cart.items.reduce((sum, item) => {
      return sum + (item.precio * item.cantidad);
    }, 0);

    // Calcular descuento basado en cantidad total
    const totalQuantity = cart.items.reduce((sum, item) => sum + item.cantidad, 0);
    const discountRule = this.getDiscountRule(totalQuantity);
    const discountPercentage = discountRule.percentage;
    const discount = subtotal * (discountPercentage / 100);

    // Calcular costo de envío
    let shippingCost = 0;
    if (cart.shippingMethod === 'envio' && cart.shippingZone) {
      shippingCost = this.SHIPPING_COSTS[cart.shippingZone as keyof typeof this.SHIPPING_COSTS] || 0;
    }

    // Calcular total
    const total = subtotal - discount + shippingCost;

    return {
      ...cart,
      subtotal: Math.round(subtotal * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      discountPercentage,
      shippingCost,
      total: Math.round(total * 100) / 100
    };
  }

  private getDiscountRule(quantity: number): DiscountRule {
    return this.DISCOUNT_RULES.find(rule => {
      if (rule.maxQuantity === null) {
        return quantity >= rule.minQuantity;
      }
      return quantity >= rule.minQuantity && quantity <= rule.maxQuantity;
    }) || this.DISCOUNT_RULES[0];
  }

  addToCart(product: any): void {
    let cart = this.cartSubject.value;
    const existingItem = cart.items.find(item => item.productId === product.id);

    if (existingItem) {
      existingItem.cantidad++;
    } else {
      cart.items.push({
        productId: product.id,
        nombre: product.nombre,
        precio: product.precio,
        cantidad: 1,
        imagen: product.imagen
      });
    }

    cart = this.calculateTotals(cart);
    this.saveCart(cart);
    this.cartSubject.next(cart);
  }

  removeFromCart(productId: number): void {
    let cart = this.cartSubject.value;
    cart.items = cart.items.filter(item => item.productId !== productId);

    if (cart.items.length === 0) {
      cart = this.getInitialCart();
    } else {
      cart = this.calculateTotals(cart);
    }

    this.saveCart(cart);
    this.cartSubject.next(cart);
  }

  updateQuantity(productId: number, cantidad: number): void {
    let cart = this.cartSubject.value;
    const item = cart.items.find(item => item.productId === productId);

    if (item) {
      if (cantidad <= 0) {
        this.removeFromCart(productId);
      } else {
        item.cantidad = cantidad;
        cart = this.calculateTotals(cart);
        this.saveCart(cart);
        this.cartSubject.next(cart);
      }
    }
  }

  setShippingMethod(method: 'recogida' | 'envio', zone?: string): void {
    let cart = this.cartSubject.value;
    cart.shippingMethod = method;
    if (zone) {
      cart.shippingZone = zone as 'local' | 'regional' | 'nacional';
    }

    cart = this.calculateTotals(cart);
    this.saveCart(cart);
    this.cartSubject.next(cart);
  }

  getCart(): Observable<Cart> {
    return this.cart$;
  }

  getTotalItems(): number {
    return this.cartSubject.value.items.reduce((sum, item) => sum + item.cantidad, 0);
  }

  getTotalQuantity(): number {
    return this.getTotalItems();
  }

  getDiscountRules(): DiscountRule[] {
    return this.DISCOUNT_RULES;
  }

  getShippingCosts() {
    return this.SHIPPING_COSTS;
  }

  clearCart(): void {
    const cart = this.getInitialCart();
    localStorage.removeItem(this.STORAGE_KEY);
    this.cartSubject.next(cart);
  }

  getCurrentCart(): Cart {
    return this.cartSubject.value;
  }
}
