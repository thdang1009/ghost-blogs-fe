
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { ghostLog, handleError } from '@shared/common';

const apiUrl = environment.apiUrl + '/v1/aws';

@Injectable({
    providedIn: 'root'
})
export class AWSService {

    constructor(private http: HttpClient) { }

    getAWSStoragedSpace(): Observable<any> {
        const url = `${apiUrl}/space-left`;
        return this.http.get<any>(url).pipe(
            tap(_ => ghostLog(`getAWSStoragedSpace`)),
            catchError(handleError<any>(`getAWSStoragedSpace`))
        );
    }

}