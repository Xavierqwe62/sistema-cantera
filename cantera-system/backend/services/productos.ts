import { Component, OnInit } from '@angular/core';
import { ProductosService } from '../services/productos.spec.ts';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './productos.html',
  styleUrl: './productos.css'
})

export class ProductosComponent implements OnInit {

  productos: any[] = [];

  constructor(
    private productosService: ProductosService
  ){}

  ngOnInit(): void {

    this.productosService.obtenerProductos()
      .subscribe((data: any) => {

        this.productos = data;

      });

  }

}