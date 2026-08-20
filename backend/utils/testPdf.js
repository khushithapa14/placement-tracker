const extractTextFromPDF = require("./pdfParser");

const test = async () => {
  try {
    const filePath = "C:/Users/Acer1/Downloads/1resume.pdf";

    const text = await extractTextFromPDF(filePath);

    if (text) {
      console.log("Extracted text:");
      console.log(text);
    } else {
      console.log("Could not extract text from PDF");
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
};

test();
