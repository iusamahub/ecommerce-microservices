import { Injectable, signal } from '@angular/core';

export interface Toast {
  text: string;
  type: 'success' | 'error';
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  readonly toast = signal<Toast | null>(null);
  private timeoutId?: ReturnType<typeof setTimeout>;

  show(text: string, type: Toast['type'] = 'success', durationMs = 3000): void {
    clearTimeout(this.timeoutId);
    this.toast.set({ text, type });
    this.timeoutId = setTimeout(() => this.toast.set(null), durationMs);
  }
}
