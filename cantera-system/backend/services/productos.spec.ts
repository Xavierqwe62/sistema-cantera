import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class ProductosService {

  api = 'http://localhost:3000/productos';

  constructor(private http: HttpClient) { }

  obtenerProductos(){
    return this.http.get(this.api);
  }

}