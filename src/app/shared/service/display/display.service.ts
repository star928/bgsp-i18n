import { HttpClient, HttpEvent, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';
import { DigitalSignage } from "../../model/signage.model";

@Injectable({
  providedIn: "root",
})
export class DisplayService {
  constructor(private http: HttpClient) { }

  getList(): Observable<Array<DigitalSignage>> {
    return this.http.get<Array<DigitalSignage>>("/cgi-center/display/default").pipe(map(res => res));
  }
  createSignage(digitalSignage: FormData): Observable<any> {
    return this.http.post<any>(
      "/cgi-center/manager-display/default",
      digitalSignage
    );
  }
  updateSignage(digitalSignage: FormData): Observable<any> {
    return this.http.post<any>(
      "/cgi-center/manager-display/default",
      digitalSignage
    );
  }
  deleteSignage(signageId: string): Observable<any> {
    return this.http.delete<any>("/cgi-center/manager-display/default", {
      body: { id: signageId },
    });
  }
  getMarqueeText(signageId: string, sourceId: string): Observable<Object> {
    return this.http.post<Object>("/cgi-center/display/default", {
      id: signageId,
      source: sourceId,
      text: "",
    });
  }
  getNextFile(
    signageId: string,
    sourceId: string,
    fileUUID: string
  ): Observable<Object> {
    return this.http.post<Object>("/cgi-center/display/default", {
      id: signageId,
      source: sourceId,
      file: fileUUID,
    });
  }
  uploadFiles(file: FormData): Observable<HttpEvent<any>> {
    return this.http.post<HttpEvent<any>>(
      "/cgi-center/manager-display/default",
      file,
      { reportProgress: true, observe: "events" }
    );
  }

  getFile(fileId: string): Observable<Blob> {
    return this.http.get<Blob>(`/resource-center/${fileId}`, {
      responseType: "blob" as "json",
    });
  }

  deleteFile(
    signageId: string,
    sourceId: string,
    fileUUID: string
  ): Observable<any> {
    let data = { id: signageId, source: sourceId, file: fileUUID };
    return this.http.delete<any>("/cgi-center/manager-display/default", {
      body: data,
    });
  }
  publishSignage(signageId: string): Observable<any> {
    return this.http.put<any>("/cgi-center/manager-display/default", {
      id: signageId,
    });
  }
}
