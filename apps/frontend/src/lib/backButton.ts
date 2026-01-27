'use client';

type BackButtonHandler = () => boolean;

class BackButtonService {
  private handlers: BackButtonHandler[] = [];

  /**
   * Register a handler to the stack (LIFO)
   * @returns Unregister function
   */
  register(handler: BackButtonHandler): () => void {
    this.handlers.push(handler);
    return () => this.unregister(handler);
  }

  /**
   * Remove handler from stack
   */
  unregister(handler: BackButtonHandler): void {
    const index = this.handlers.indexOf(handler);
    if (index > -1) {
      this.handlers.splice(index, 1);
    }
  }

  /**
   * Handle back button press (calls last registered handler)
   * @returns true if handled by a registered handler
   */
  handle(): boolean {
    if (this.handlers.length === 0) {
      return false;
    }

    const handler = this.handlers[this.handlers.length - 1];
    return handler();
  }

  /**
   * Check if there are active handlers
   */
  hasHandlers(): boolean {
    return this.handlers.length > 0;
  }
}

export const backButtonService = new BackButtonService();
