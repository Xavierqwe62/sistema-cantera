import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService, Cart } from '../../cart.service';

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  categoria: string;
}

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
})
export class Catalogo implements OnInit {
  productos: Producto[] = [];
  categoriaSeleccionada: string = 'todos';
  categorias: string[] = ['Cantera Blanca', 'Adoquín', 'Fachaleta', 'Columnas', 'Accesorios'];
  cart: Cart | null = null;
  mostrarCarrito = false;
  totalItems = 0;

  constructor(public cartService: CartService) {}

  ngOnInit() {
    this.cargarProductos();
    this.cartService.getCart().subscribe(cart => {
      this.cart = cart;
      this.totalItems = this.cartService.getTotalItems();
    });
  }

  cargarProductos() {
    this.productos = [
      {
        id: 1,
        nombre: 'Cantera Blanca Premium',
        descripcion: 'Bloques de cantera blanca de alta calidad para fachadas modernas',
        precio: 450,
        imagen: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?q=80&w=500',
        categoria: 'Cantera Blanca'
      },
      {
        id: 2,
        nombre: 'Adoquín de Cantera Gris',
        descripcion: 'Adoquines resistentes para exteriores, caminos y patios',
        precio: 320,
        imagen: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=500',
        categoria: 'Adoquín'
      },
      {
        id: 3,
        nombre: 'Fachaleta Decorativa',
        descripcion: 'Diseño elegante para interiores y exteriores',
        precio: 280,
        imagen: 'https://images.unsplash.com/photo-1523419409543-7b3f67c8d8d0?q=80&w=500',
        categoria: 'Fachaleta'
      },
      {
        id: 4,
        nombre: 'Columnas de Cantera',
        descripcion: 'Columnas decorativas y estructurales de diversos tamaños',
        precio: 800,
        imagen: 'https://images.unsplash.com/photo-1554995207-c18231b6ce48?q=80&w=500',
        categoria: 'Columnas'
      },
      {
        id: 5,
        nombre: 'Piedra Cantera Roja',
        descripcion: 'Cantera roja para acabados cálidos y rusticos',
        precio: 380,
        imagen: 'https://images.unsplash.com/photo-1467971512851-c2912f53a080?q=80&w=500',
        categoria: 'Cantera Blanca'
      },
      {
        id: 6,
        nombre: 'Soleras de Cantera',
        descripcion: 'Soleras para marcos de puertas y ventanas',
        precio: 200,
        imagen: 'https://images.unsplash.com/photo-1532005088129-9e2d8aaabcde?q=80&w=500',
        categoria: 'Accesorios'
      },
      {
        id: 7,
        nombre: 'Adoquín Hexagonal',
        descripcion: 'Adoquines en forma hexagonal para diseños únicos',
        precio: 350,
        imagen: 'https://images.unsplash.com/photo-1489749798305-4fea3ba63d60?q=80&w=500',
        categoria: 'Adoquín'
      },
      {
        id: 8,
        nombre: 'Cornisa de Cantera',
        descripcion: 'Cornisas decorativas para acabados arquitectónicos',
        precio: 420,
        imagen: 'https://images.unsplash.com/photo-1517457373614-b7152f800fd1?q=80&w=500',
        categoria: 'Accesorios'
      },
      {
        id: 9,
        nombre: 'Fachaleta Rústica',
        descripcion: 'Acabado rústico de cantera para muros interiores',
        precio: 310,
        imagen: 'https://images.unsplash.com/photo-1505409858301-b72b27e84530?q=80&w=500',
        categoria: 'Fachaleta'
      }
    ];
  }

  get productosFiltrados(): Producto[] {
    if (this.categoriaSeleccionada === 'todos') {
      return this.productos;
    }
    return this.productos.filter(p => p.categoria === this.categoriaSeleccionada);
  }

  filtrarPorCategoria(categoria: string) {
    this.categoriaSeleccionada = categoria;
  }

  agregarAlCarrito(producto: Producto) {
    this.cartService.addToCart(producto);
  }

  abrirCarrito() {
    this.mostrarCarrito = true;
  }

  cerrarCarrito() {
    this.mostrarCarrito = false;
  }

  eliminarDelCarrito(productId: number) {
    this.cartService.removeFromCart(productId);
  }

  actualizarCantidad(productId: number, cantidad: number) {
    this.cartService.updateQuantity(productId, Math.max(1, cantidad));
  }

  establecerMetodoEnvio(method: 'recogida' | 'envio', zone?: string) {
    this.cartService.setShippingMethod(method, zone);
  }

  obtenerDescuentoActivo(): string {
    if (this.cart && this.cart.discountPercentage > 0) {
      const totalQuantity = this.cart.items.reduce((sum, item) => sum + item.cantidad, 0);
      const regla = this.cartService.getDiscountRules().find(r => {
        if (r.maxQuantity === null) {
          return totalQuantity >= r.minQuantity;
        }
        return totalQuantity >= r.minQuantity && totalQuantity <= r.maxQuantity;
      });
      return regla?.label || '';
    }
    return 'Menudeo (1-4 piezas)';
  }
}
