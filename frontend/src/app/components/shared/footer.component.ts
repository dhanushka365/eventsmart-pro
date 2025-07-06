import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <footer class="main-footer">
      <div class="footer-content">
        <!-- Top Section -->
        <div class="footer-top">
          <!-- Brand Section -->
          <div class="footer-section brand-section">
            <div class="footer-logo">
              <span class="logo-icon">🎯</span>
              <span class="brand-text">EventSmart Pro</span>
            </div>
            <p class="brand-description">
              Your ultimate platform for discovering, creating, and managing extraordinary events. 
              Connect with like-minded people and create unforgettable experiences.
            </p>
            <div class="social-links">
              <a href="#" class="social-link" aria-label="Facebook">
                <span class="social-icon">📘</span>
              </a>
              <a href="#" class="social-link" aria-label="Twitter">
                <span class="social-icon">🐦</span>
              </a>
              <a href="#" class="social-link" aria-label="Instagram">
                <span class="social-icon">📸</span>
              </a>
              <a href="#" class="social-link" aria-label="LinkedIn">
                <span class="social-icon">💼</span>
              </a>
            </div>
          </div>

          <!-- Quick Links -->
          <div class="footer-section">
            <h3 class="footer-title">Quick Links</h3>
            <ul class="footer-links">
              <li><a routerLink="/events" class="footer-link">Browse Events</a></li>
              <li><a routerLink="/events/create" class="footer-link">Create Event</a></li>
              <li><a routerLink="/dashboard" class="footer-link">Dashboard</a></li>
              <li><a routerLink="/profile" class="footer-link">My Profile</a></li>
              <li><a routerLink="/recommendations" class="footer-link">Recommendations</a></li>
            </ul>
          </div>

          <!-- Categories -->
          <div class="footer-section">
            <h3 class="footer-title">Event Categories</h3>
            <ul class="footer-links">
              <li><a href="#" class="footer-link">Business & Professional</a></li>
              <li><a href="#" class="footer-link">Technology & Innovation</a></li>
              <li><a href="#" class="footer-link">Arts & Culture</a></li>
              <li><a href="#" class="footer-link">Sports & Fitness</a></li>
              <li><a href="#" class="footer-link">Food & Drink</a></li>
            </ul>
          </div>

          <!-- Support -->
          <div class="footer-section">
            <h3 class="footer-title">Support</h3>
            <ul class="footer-links">
              <li><a href="#" class="footer-link">Help Center</a></li>
              <li><a href="#" class="footer-link">Contact Us</a></li>
              <li><a href="#" class="footer-link">Terms of Service</a></li>
              <li><a href="#" class="footer-link">Privacy Policy</a></li>
              <li><a href="#" class="footer-link">Cookie Policy</a></li>
            </ul>
          </div>

          <!-- Newsletter -->
          <div class="footer-section newsletter-section">
            <h3 class="footer-title">Stay Updated</h3>
            <p class="newsletter-description">
              Get the latest events and updates delivered to your inbox.
            </p>
            <form class="newsletter-form" (ngSubmit)="subscribeNewsletter()">
              <div class="input-group">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  class="newsletter-input"
                  [(ngModel)]="newsletterEmail"
                  name="newsletterEmail"
                  required>
                <button type="submit" class="newsletter-btn">
                  <span class="btn-text">Subscribe</span>
                  <span class="btn-icon">✉️</span>
                </button>
              </div>
            </form>
            <div class="trust-indicators">
              <div class="trust-item">
                <span class="trust-icon">🔒</span>
                <span class="trust-text">Secure & Private</span>
              </div>
              <div class="trust-item">
                <span class="trust-icon">📧</span>
                <span class="trust-text">No Spam</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="footer-divider"></div>

        <!-- Bottom Section -->
        <div class="footer-bottom">
          <div class="footer-bottom-left">
            <p class="copyright">
              © {{ currentYear }} EventSmart Pro. All rights reserved.
            </p>
            <div class="footer-badges">
              <span class="badge">🏆 Trusted Platform</span>
              <span class="badge">⚡ Fast & Reliable</span>
              <span class="badge">🌟 Top Rated</span>
            </div>
          </div>
          
          <div class="footer-bottom-right">
            <div class="footer-stats">
              <div class="stat-item">
                <span class="stat-number">10K+</span>
                <span class="stat-label">Events</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">50K+</span>
                <span class="stat-label">Users</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">100+</span>
                <span class="stat-label">Cities</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Back to Top Button -->
      <button 
        class="back-to-top" 
        (click)="scrollToTop()"
        [class.visible]="showBackToTop"
        aria-label="Back to top">
        <span class="back-to-top-icon">⬆️</span>
      </button>
    </footer>
  `,
  styles: [`
    .main-footer {
      background: linear-gradient(135deg, #2d3436 0%, #636e72 50%, #2d3436 100%);
      color: #ddd;
      position: relative;
      margin-top: auto;
    }

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 3rem 2rem 1rem;
    }

    /* Top Section */
    .footer-top {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .footer-section {
      flex: 1;
    }

    /* Brand Section */
    .brand-section {
      max-width: 350px;
    }

    .footer-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 1rem;
    }

    .logo-icon {
      font-size: 2rem;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    }

    .brand-text {
      font-size: 1.5rem;
      font-weight: 700;
      background: linear-gradient(45deg, #ffffff, #f0f8ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .brand-description {
      color: #b2bec3;
      line-height: 1.6;
      margin-bottom: 1.5rem;
      font-size: 0.95rem;
    }

    .social-links {
      display: flex;
      gap: 12px;
    }

    .social-link {
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      transition: all 0.3s ease;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .social-link:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    }

    .social-icon {
      font-size: 1.2rem;
    }

    /* Footer Sections */
    .footer-title {
      color: white;
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 1rem;
      position: relative;
    }

    .footer-title::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 0;
      width: 30px;
      height: 2px;
      background: linear-gradient(45deg, #667eea, #764ba2);
      border-radius: 2px;
    }

    .footer-links {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .footer-links li {
      margin-bottom: 8px;
    }

    .footer-link {
      color: #b2bec3;
      text-decoration: none;
      transition: all 0.3s ease;
      font-size: 0.9rem;
      position: relative;
      display: inline-block;
    }

    .footer-link:hover {
      color: #74b9ff;
      transform: translateX(5px);
    }

    .footer-link::before {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 0;
      height: 1px;
      background: #74b9ff;
      transition: width 0.3s ease;
    }

    .footer-link:hover::before {
      width: 100%;
    }

    /* Newsletter Section */
    .newsletter-section {
      max-width: 280px;
    }

    .newsletter-description {
      color: #b2bec3;
      font-size: 0.9rem;
      margin-bottom: 1rem;
      line-height: 1.5;
    }

    .newsletter-form {
      margin-bottom: 1rem;
    }

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .newsletter-input {
      padding: 12px 16px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 25px;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      font-size: 0.9rem;
      transition: all 0.3s ease;
    }

    .newsletter-input::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }

    .newsletter-input:focus {
      outline: none;
      border-color: #74b9ff;
      background: rgba(255, 255, 255, 0.15);
      box-shadow: 0 0 20px rgba(116, 185, 255, 0.3);
    }

    .newsletter-btn {
      background: linear-gradient(45deg, #667eea, #764ba2);
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 25px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .newsletter-btn:hover {
      background: linear-gradient(45deg, #5a6fd8, #6941a5);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }

    .trust-indicators {
      display: flex;
      gap: 15px;
    }

    .trust-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8rem;
      color: #b2bec3;
    }

    .trust-icon {
      font-size: 1rem;
    }

    /* Footer Divider */
    .footer-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%);
      margin: 2rem 0;
    }

    /* Footer Bottom */
    .footer-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .footer-bottom-left {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .copyright {
      color: #b2bec3;
      font-size: 0.9rem;
      margin: 0;
    }

    .footer-badges {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .badge {
      background: rgba(255, 255, 255, 0.1);
      padding: 4px 12px;
      border-radius: 15px;
      font-size: 0.8rem;
      color: #74b9ff;
      border: 1px solid rgba(116, 185, 255, 0.3);
    }

    .footer-bottom-right {
      flex-shrink: 0;
    }

    .footer-stats {
      display: flex;
      gap: 2rem;
    }

    .stat-item {
      text-align: center;
    }

    .stat-number {
      display: block;
      font-size: 1.5rem;
      font-weight: 700;
      color: white;
      background: linear-gradient(45deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .stat-label {
      font-size: 0.8rem;
      color: #b2bec3;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Back to Top Button */
    .back-to-top {
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 50px;
      height: 50px;
      background: linear-gradient(45deg, #667eea, #764ba2);
      border: none;
      border-radius: 50%;
      color: white;
      cursor: pointer;
      font-size: 1.2rem;
      transition: all 0.3s ease;
      opacity: 0;
      visibility: hidden;
      transform: translateY(20px);
      z-index: 1000;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    .back-to-top.visible {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .back-to-top:hover {
      background: linear-gradient(45deg, #5a6fd8, #6941a5);
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }

    /* Mobile Responsive */
    @media (max-width: 1024px) {
      .footer-top {
        grid-template-columns: repeat(3, 1fr);
        gap: 1.5rem;
      }

      .brand-section {
        grid-column: 1 / -1;
        max-width: none;
        margin-bottom: 1rem;
      }

      .newsletter-section {
        grid-column: 2 / -1;
        max-width: none;
      }
    }

    @media (max-width: 768px) {
      .footer-content {
        padding: 2rem 1rem 1rem;
      }

      .footer-top {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .footer-bottom {
        flex-direction: column;
        text-align: center;
        gap: 1.5rem;
      }

      .footer-stats {
        justify-content: center;
        gap: 1.5rem;
      }

      .footer-badges {
        justify-content: center;
      }

      .input-group {
        flex-direction: row;
      }

      .newsletter-input {
        flex: 1;
        border-radius: 25px 0 0 25px;
      }

      .newsletter-btn {
        border-radius: 0 25px 25px 0;
        padding: 12px 16px;
      }

      .btn-text {
        display: none;
      }

      .trust-indicators {
        justify-content: center;
      }

      .back-to-top {
        bottom: 20px;
        right: 20px;
        width: 45px;
        height: 45px;
      }
    }

    @media (max-width: 480px) {
      .footer-content {
        padding: 1.5rem 1rem 1rem;
      }

      .social-links {
        justify-content: center;
      }

      .footer-stats {
        gap: 1rem;
      }

      .stat-number {
        font-size: 1.3rem;
      }

      .input-group {
        flex-direction: column;
      }

      .newsletter-input,
      .newsletter-btn {
        border-radius: 25px;
      }

      .btn-text {
        display: inline;
      }
    }
  `]
})
export class FooterComponent implements OnInit {
  currentYear = new Date().getFullYear();
  newsletterEmail = '';
  showBackToTop = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.showBackToTop = window.pageYOffset > 300;
  }

  ngOnInit() {
    // Initialize component
  }

  subscribeNewsletter() {
    if (this.newsletterEmail) {
      // Here you would typically call an API to subscribe the user
      console.log('Newsletter subscription for:', this.newsletterEmail);
      
      // Show success message (you can implement a toast service)
      alert('Thank you for subscribing to our newsletter!');
      
      // Clear the input
      this.newsletterEmail = '';
    }
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
