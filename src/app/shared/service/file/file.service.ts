import { Injectable } from "@angular/core";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

const EXCEL_EXTENSION = ".xlsx";
const CSV_EXTENSION = ".csv";
const CSV_TYPE = "text/csv";

@Injectable({
  providedIn: "root",
})
export class FileService {
  constructor() {}

  private saveAsFile(buffer: any, fileName: string, fileType: string): void {
    const data: Blob = new Blob(["\ufeff", buffer], { type: fileType });
    saveAs(data, fileName);
  }

  public downloadFile(data: any, fileName: string) {
    const replacer = (key, value) => (value === null ? "" : value);
    const header = Object.keys(data[0]);
    let csv = data.map((row) =>
      header
        .map((fieldName) => JSON.stringify(row[fieldName], replacer))
        .join(",")
    );
    csv.unshift(header.join(","));
    let csvArray = csv.join("\r\n");

    this.saveAsFile(csvArray, `${fileName}${CSV_EXTENSION}`, CSV_TYPE);
  }

  public exportToCsv(
    rows: Object[],
    fileName: string,
    columns?: string[]
  ): string {
    if (!rows || !rows.length) {
      return;
    }
    const separator = ",";
    const keys = Object.keys(rows[0]).filter((k) => {
      if (columns?.length) {
        return columns.includes(k);
      } else {
        return true;
      }
    });
    const csvContent =
      keys.join(separator) +
      "\n" +
      rows
        .map((row) => {
          return keys
            .map((k) => {
              let cell = row[k] === null || row[k] === undefined ? "" : row[k];
              cell =
                cell instanceof Date
                  ? cell.toLocaleString()
                  : cell.toString().replace(/"/g, '""');
              if (cell.search(/("|,|\n)/g) >= 0) {
                cell = `"${cell}"`;
              }
              return cell;
            })
            .join(separator);
        })
        .join("\n");
    this.saveAsFile(csvContent, `${fileName}${CSV_EXTENSION}`, CSV_TYPE);
  }
}
