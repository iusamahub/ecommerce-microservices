import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../model/product';

const API_URL = 'http://localhost:9000/api/products';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(private httpClient: HttpClient) {}

  getProducts(): Observable<Array<Product>> {
    return this.httpClient.get<Array<Product>>(API_URL);
  }

  createProduct(product: Product): Observable<Product> {
    return this.httpClient.post<Product>(API_URL, product);
  }
}
