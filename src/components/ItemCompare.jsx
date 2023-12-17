import { useState } from "react";
import Tesseract from "tesseract.js";

import { FontAwesomeIcon, Camera } from "../globals/faIcons";

const ItemCompare = () => {
  const [image, setImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [parsedText, setParsedText] = useState([null]);

  const addItem = (item) => {
    setParsedText((currentArray) => [...currentArray, item]);
  };

  const processImage = async (image) => {
    setProcessing(true);
    try {
      const { data } = await Tesseract.recognize(image, "eng");

      const lines = data.lines;
      //console.log("Lines:", lines);

      const excludedPatterns = [
        "Item Power",
        "Resistance to All Elements",
        "Critical Strikes that Overpower deal",
        "Be DS of BRE Ol 0 Te)",
      ];

      const relevantLines = lines.filter((line, index) => {
        const currentLineText = line.text;
        const nextLineText =
          index < lines.length - 1 ? lines[index + 1].text : "";

        if (
          excludedPatterns.some((pattern) => currentLineText.includes(pattern))
        ) {
          return false;
        }

        return (
          currentLineText.includes("©") ||
          nextLineText.includes("]") ||
          nextLineText.includes("%")
        );
      });

      setOcrResult(relevantLines);
      addItem(relevantLines);
    } catch (error) {
      console.error("Error processing image:", error);
    } finally {
      console.log("OCR process completed.");
      setProcessing(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const imageData = event.target.result;
      setImage(imageData);
      processImage(imageData);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div>
      <FontAwesomeIcon icon={Camera} size={"6x"} color="#fff" />
      <input type="file" onChange={(e) => handleImageUpload(e)} />
      {image && (
        <div>
          <img src={image} alt="Uploaded Item" style={{ height: "500px" }} />
          {processing ? (
            <div>Processing...</div>
          ) : (
            <div>
              <p>OCR Result:</p>
              {ocrResult && ocrResult.length > 0 ? (
                ocrResult.map((parsedText, index) => (
                  <p key={index}>{parsedText.text}</p>
                ))
              ) : (
                <p>No relevant OCR result available</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ItemCompare;
