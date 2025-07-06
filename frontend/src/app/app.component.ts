import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from './components/shared/header.component';
import { FooterComponent } from './components/shared/footer.component';
import { LayoutService } from './services/layout.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, ReactiveFormsModule, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'EventSmart Pro';
  showHeader$: Observable<boolean>;
  showFooter$: Observable<boolean>;

  constructor(private layoutService: LayoutService) {
    this.showHeader$ = this.layoutService.showHeader$;
    this.showFooter$ = this.layoutService.showFooter$;
  }

  ngOnInit() {
    // Layout service now handles initialization automatically
  }
}
