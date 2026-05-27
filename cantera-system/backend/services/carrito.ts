import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class CarritoService {

  carrito: any[] = [];

  agregarProducto(producto: any){

    const existe = this.carrito.find(
      p => p.id_producto === producto.id_producto
    );

    if(existe){

      existe.cantidad++;

    }else{

      this.carrito.push({
        ...producto,
        cantidad: 1
      });

    }

  }

  obtenerCarrito(){

    return this.carrito;

  }

  total(){

    return this.carrito.reduce(
      (acc, item) => {

        let precio = item.precio_unitario;

        if(item.cantidad >= item.cantidad_mayoreo){

          precio = item.precio_mayoreo;

        }

        return acc + (precio * item.cantidad);

      }, 0
    );

  }

}