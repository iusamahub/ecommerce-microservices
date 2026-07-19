import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Inventory } from '../model/inventory';

const API_URL = 'http://localhost:9000/api/inventory';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  constructor(private httpClient: HttpClient) {}

  addStock(inventory: Inventory): Observable<Inventory> {
    return this.httpClient.post<Inventory>(API_URL, inventory);
  }

  getQuantities(skuCodes: string[]): Observable<Inventory[]> {
    return this.httpClient.get<Inventory[]>(API_URL, { params: { skuCodes } });
  }
}
