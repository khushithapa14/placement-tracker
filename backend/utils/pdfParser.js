const fs = require("fs");
const { PDFParse } = require("pdf-parse");

const extractTextFromPDF = async (filePath) => {
  let parser;

  try {
    const dataBuffer = fs.readFileSync(filePath);

    parser = new PDFParse({
      data: dataBuffer,
    });

    const result = await parser.getText();

    console.log(`Pages: ${result.total}`);

    return result.text;
  } catch (error) {
    console.error("PDF text extraction error:", error);
    return null;
  } finally {
    if (parser) {
      await parser.destroy();
    }
  }
};

module.exports = extractTextFromPDF;
