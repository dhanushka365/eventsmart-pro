import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private showHeaderSubject = new BehaviorSubject<boolean>(false);
  private showFooterSubject = new BehaviorSubject<boolean>(false);

  public showHeader$ = this.showHeaderSubject.asObservable();
  public showFooter$ = this.showFooterSubject.asObservable();

  constructor() {
    // Initialize with default layout after a brief delay to avoid change detection issues
    setTimeout(() => {
      this.showMainLayout();
    }, 0);
  }

  setHeaderVisibility(show: boolean) {
    this.showHeaderSubject.next(show);
  }

  setFooterVisibility(show: boolean) {
    this.showFooterSubject.next(show);
  }

  setLayoutVisibility(showHeader: boolean, showFooter: boolean) {
    this.showHeaderSubject.next(showHeader);
    this.showFooterSubject.next(showFooter);
  }

  // Convenience methods for common layouts
  showFullLayout() {
    this.setLayoutVisibility(true, true);
  }

  hideFullLayout() {
    this.setLayoutVisibility(false, false);
  }

  showAuthLayout() {
    // For login/register pages - typically no header/footer
    this.setLayoutVisibility(false, false);
  }

  showMainLayout() {
    // For main app pages
    this.setLayoutVisibility(true, true);
  }
}
