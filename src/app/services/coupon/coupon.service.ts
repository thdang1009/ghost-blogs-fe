import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Coupon } from '@models/_index';
import { handleError } from '@shared/common';

const apiUrl = environment.apiUrl + '/v1/coupon';

@Injectable({
  providedIn: 'root'
})
export class CouponService {

  constructor(private http: HttpClient) { }

  getCoupons(): Observable<Coupon[]> {
    return this.http.get<Coupon[]>(apiUrl)
      .pipe(
        catchError(handleError<Coupon[]>('getCoupons', []))
      );
  }

  getPartnerCoupons(partner: 'A' | 'B'): Observable<Coupon[]> {
    return this.http.get<Coupon[]>(`${apiUrl}/partner/${partner}`)
      .pipe(
        catchError(handleError<Coupon[]>('getPartnerCoupons', []))
      );
  }

  getCoupon(id: string): Observable<Coupon> {
    return this.http.get<Coupon>(`${apiUrl}/${id}`)
      .pipe(
        catchError(handleError<Coupon>('getCoupon'))
      );
  }

  addCoupon(coupon: Coupon): Observable<Coupon> {
    return this.http.post<Coupon>(apiUrl, { ...coupon, quantity: 1 })
      .pipe(
        catchError(handleError<Coupon>('addCoupon'))
      );
  }

  bulkAddCoupons(count: number, partner: 'A' | 'B' = 'A'): Observable<any> {
    return this.http.post<any>(apiUrl, { quantity: count, partner })
      .pipe(
        catchError(handleError('bulkAddCoupons'))
      );
  }

  updateCoupon(id: string, coupon: Coupon): Observable<Coupon> {
    return this.http.put<Coupon>(`${apiUrl}/${id}`, coupon)
      .pipe(
        catchError(handleError<Coupon>('updateCoupon'))
      );
  }

  deleteCoupon(id: string): Observable<any> {
    return this.http.delete<any>(`${apiUrl}/${id}`)
      .pipe(
        catchError(handleError('deleteCoupon'))
      );
  }

  redeemCoupons(couponIds: string[], rewardId: string, rewardDescription: string, partner: 'A' | 'B'): Observable<any> {
    return this.http.patch<any>(apiUrl, { couponIds, rewardId, rewardDescription, partner })
      .pipe(
        catchError(handleError('redeemCoupons'))
      );
  }
}
