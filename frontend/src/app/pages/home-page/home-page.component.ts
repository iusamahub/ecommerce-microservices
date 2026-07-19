import { Component, inject, OnInit } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Product } from '../../model/product';
import { ProductService } from '../../services/product.service';
import { InventoryService } from '../../services/inventory.service';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { Order, UserDetails } from '../../model/order';
import { OrderService } from '../../services/order.service';
import { ToastService } from '../../services/toast.service';

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
  private readonly inventoryService = inject(InventoryService);
  private readonly orderService = inject(OrderService);
  private readonly toastService = inject(ToastService);

  isAuthenticated = false;
  products: Array<Product> = [];
  stockBySkuCode: Record<string, number> = {};
  quantities: Record<string, number> = {};
  userDetails: UserDetails | null = null;

  quantityIsNull = false;

  ngOnInit(): void {
    this.oidcSecurityService.isAuthenticated$.subscribe(({ isAuthenticated }) => {
      this.isAuthenticated = isAuthenticated;
      if (isAuthenticated) {
        this.productService.getProducts().subscribe((products) => {
          this.products = products;
          const skuCodes = products.map((p) => p.skuCode).filter((skuCode): skuCode is string => !!skuCode);
          if (skuCodes.length > 0) {
            this.inventoryService.getQuantities(skuCodes).subscribe((inventory) => {
              this.stockBySkuCode = Object.fromEntries(inventory.map((i) => [i.skuCode, i.quantity]));
            });
          }
        });
      }
    });
    this.oidcSecurityService.userData$.subscribe(({ userData }) => {
      this.userDetails = userData
        ? {
            email: userData.email,
            firstName: userData.given_name,
            lastName: userData.family_name,
          }
        : null;
    });
  }

  inStock(product: Product): boolean {
    return (this.stockBySkuCode[product.skuCode] ?? 0) > 0;
  }

  get hasInStockProducts(): boolean {
    return this.products.some((product) => this.inStock(product));
  }

  orderProduct(product: Product, quantity: number): void {
    this.quantityIsNull = false;

    if (!quantity) {
      this.quantityIsNull = true;
      return;
    }

    if (!this.userDetails) {
      this.toastService.show('You must be logged in to place an order.', 'error');
      return;
    }

    const order: Order = {
      skuCode: product.skuCode,
      price: product.price,
      quantity,
      userDetails: this.userDetails,
    };

    this.orderService.orderProduct(order).subscribe({
      next: () => this.toastService.show('Order placed successfully!', 'success'),
      error: () => this.toastService.show('Failed to place order. The product may be out of stock.', 'error'),
    });
  }
}
