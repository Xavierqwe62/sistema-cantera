import { Component, OnInit } from '@angular/core';
import { ProductosService } from '../../services/productos.spec.ts';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css'
})

export class CatalogoComponent implements OnInit {

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