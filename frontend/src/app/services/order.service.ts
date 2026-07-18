import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../model/order';

const API_URL = 'http://localhost:9000/api/order';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  constructor(private httpClient: HttpClient) {}

  orderProduct(order: Order): Observable<string> {
    return this.httpClient.post(API_URL, order, { responseType: 'text' });
  }
}
