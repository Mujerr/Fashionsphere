import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { paypalConfig } from './PaypalConfig/paypal.config';

@Injectable({
  providedIn: 'root'
})
export class PaypalService {
  private apiUrl = 'https://api-m.sandbox.paypal.com';

  constructor(private http: HttpClient) { }

  getAccessToken(): Observable<any> {
    const url = `${this.apiUrl}/v1/oauth2/token`;
    const clientId = paypalConfig.clientId;
    const clientSecret = paypalConfig.clientSecret;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Authorization', `Basic ${btoa(`${clientId}:${clientSecret}`)}`);

    const body = 'grant_type=client_credentials';

    return this.http.post(url, body, { headers });
  }

  createOrder(amount: number, accessToken: string): Observable<any> {
    const url = `${this.apiUrl}/v2/checkout/orders`;
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${accessToken}`);
    const body = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: amount.toFixed(2)
          }
        }
      ]
    };
    return this.http.post(url, body, { headers });
  }

  captureOrder(orderId: string, accessToken: string): Observable<any> {
    const url = `${this.apiUrl}/v2/checkout/orders/${orderId}/capture`;
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${accessToken}`);
    return this.http.post(url, null, { headers });
  }
}
