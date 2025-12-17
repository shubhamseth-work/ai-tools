import fs from 'fs';
import path from 'path';
import { createObjectCsvWriter as createCsvWriter } from "csv-writer";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { PDFParse } from 'pdf-parse';
const dirPath = path.join(__dirname, "excels");
// Ensure folder exists

const uniqueTimestamp = Date.now();
const fileName = `filtered_records_${uniqueTimestamp}.csv`;
const csvFilePath = path.join(dirPath, fileName);
// Folder containing PDFs
const pdfFolder = path.join(__dirname, "pdfs");
console.log('PDF folder path:', pdfFolder);

const csvWriter = createCsvWriter({
    path: csvFilePath,
    header: [
        { id: "acNo", title: "AC_NO" },
        { id: "partNo", title: "PART_NO" },
        { id: "serialNoInPart", title: "SL_NO_IN_PART_NO" },
        { id: "firstName", title: "FIRST_NAME" },
        { id: "lastName", title: "LAST_NAME" },
        { id: "rlnFm", title: "RLN_FM_NM" },
        { id: "rlnLn", title: "RLN_L_NM" },
        { id: "idcard", title: "IDCARD_NO" },
        { id: "pdfName", title: "PDF_NAME" },
        { id: "gender", title: "Gender" },
        { id: "age", title: "Age" },
    ]
});
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// Hindi values to match


function parseRow(line) {
    // Split by spaces but keep Hindi text together
    const cols = line.trim().split(/\s+/);

    return {
        acNo: cols[0] || "",
        partNo: cols[1] || "",
        serialNoInPart: cols[2] || "",
        firstName: cols[6] || "",
        lastName: cols[7] || "",
        rlnFm: cols[9] || "",
        rlnLn: cols[10] || "",
        idcard: cols[11] || "",
        gender: cols[12] || "",
        age: cols[13] || "",
    };
}

async function processPDF(filePath, pdfName) {
    // const dataBuffer = fs.readFileSync(filePath);
    const parser = new PDFParse({ url: filePath });
    const pdfData = await parser.getText();
    await parser.destroy();
    
    const lines = pdfData.text.split("\n");
    // console.log(lines);
    const results = [];
    // const FIRST = "कमल";
    // const LAST = "साह";
    const FIRST = "गीता";
    const LAST = "देवी";
    for (let line of lines) {
        if (line.includes("गीता") || line.includes("देवी")) {
        // if (line.includes("कमल") || line.includes("साह") || line.includes("गीता") || line.includes("देवी")) {
            const row = parseRow(line);

            const match1 = row.firstName === FIRST && row.lastName === LAST;
            const match2 = row.rlnFm === FIRST && row.rlnLn === LAST;

            if (match1 || match2) {
                results.push({ ...row, pdfName });
            }
            results.push({ ...row, pdfName });
        }
    }

    return results;
}
const extractRecrodFromDocument = async (req, res) => {
    
    try {
        const files = fs.readdirSync(pdfFolder).filter(f => f.endsWith(".pdf"));
        let finalResult = [];

        for (let i=0; i<files.length; i++) {
            const file = files[i];
            const filePath = path.join(pdfFolder, file);
            console.log("Reading PDF:", file);
            console.log("File path:", filePath);
            const rows = await processPDF(filePath, file);
            // await delay(2000);
            finalResult = finalResult.concat(rows);
        }

        // Save CSV
        await csvWriter.writeRecords(finalResult);

        console.log("\n Extraction completed!");
        console.log("Total Matched Records:", finalResult.length);
        console.log("Saved to → filtered_records.csv");
        return finalResult;
    } catch (error) {
        console.log(`Failed to Extraction: ${error}`);
        return error;
    }
}


export { extractRecrodFromDocument };