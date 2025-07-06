import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private showHeaderSubject = new BehaviorSubject<boolean>(true);
  private showFooterSubject = new BehaviorSubject<boolean>(true);

  public showHeader$ = this.showHeaderSubject.asObservable();
  public showFooter$ = this.showFooterSubject.asObservable();

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
