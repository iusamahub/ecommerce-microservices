import { Component, inject, OnInit } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Product } from '../../model/product';
import { ProductService } from '../../services/product.service';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { Order } from '../../model/order';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [FormsModule, CurrencyPipe],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
})
export class HomePageComponent implements OnInit {
  private readonly oidcSecurityService = inject(OidcSecurityService);
  private readonly productService = inject(ProductService);
  private readonly orderService = inject(OrderService);

  isAuthenticated = false;
  products: Array<Product> = [];
  quantities: Record<string, number> = {};

  quantityIsNull = false;
  orderSuccess = false;
  orderFailed = false;

  ngOnInit(): void {
    this.oidcSecurityService.isAuthenticated$.subscribe(({ isAuthenticated }) => {
      this.isAuthenticated = isAuthenticated;
      if (isAuthenticated) {
        this.productService.getProducts().subscribe((products) => {
          this.products = products;
        });
      }
    });
  }

  orderProduct(product: Product, quantity: number): void {
    this.orderSuccess = false;
    this.orderFailed = false;
    this.quantityIsNull = false;

    if (!quantity) {
      this.quantityIsNull = true;
      return;
    }

    const order: Order = {
      skuCode: product.skuCode,
      price: product.price,
      quantity,
    };

    this.orderService.orderProduct(order).subscribe({
      next: () => (this.orderSuccess = true),
      error: () => (this.orderFailed = true),
    });
  }
}
