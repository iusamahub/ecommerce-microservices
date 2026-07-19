import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Product } from '../../model/product';
import { ProductService } from '../../services/product.service';
import { InventoryService } from '../../services/inventory.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css',
})
export class AddProductComponent {
  private readonly productService = inject(ProductService);
  private readonly inventoryService = inject(InventoryService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  addProductForm: FormGroup = this.fb.group({
    skuCode: ['', [Validators.required]],
    name: ['', [Validators.required]],
    description: ['', [Validators.required]],
    price: [0, [Validators.required, Validators.min(0.01)]],
    initialStock: [0, [Validators.required, Validators.min(1)]],
  });

  onSubmit(): void {
    if (this.addProductForm.invalid) {
      this.addProductForm.markAllAsTouched();
      return;
    }

    const skuCode = this.addProductForm.get('skuCode')?.value;

    const product: Product = {
      skuCode,
      name: this.addProductForm.get('name')?.value,
      description: this.addProductForm.get('description')?.value,
      price: this.addProductForm.get('price')?.value,
    };

    this.productService.createProduct(product).subscribe(() => {
      this.inventoryService
        .addStock({ skuCode, quantity: this.addProductForm.get('initialStock')?.value })
        .subscribe(() => {
          this.toastService.show('Product created successfully!', 'success');
          this.router.navigate(['/']);
        });
    });
  }

  get skuCode() {
    return this.addProductForm.get('skuCode');
  }
  get name() {
    return this.addProductForm.get('name');
  }
  get description() {
    return this.addProductForm.get('description');
  }
  get price() {
    return this.addProductForm.get('price');
  }
  get initialStock() {
    return this.addProductForm.get('initialStock');
  }
}
