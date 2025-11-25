import jsPDF from "jspdf";
import type { Question } from "@shared/schema";

export async function generateSurveyPDF(
  title: string,
  description: string,
  questions: Question[],
  welcomeMessage: string,
  thankYouMessage: string,
  estimatedMinutes?: number
): Promise<jsPDF> {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 13; // ~0.5 inch
  const contentWidth = pageWidth - 2 * margin;
  const leftColWidth = contentWidth * 0.55;
  const rightColStart = margin + leftColWidth + 4;
  const rightColWidth = pageWidth - rightColStart - margin;
  
  let currentY = margin;
  let pageNumber = 1;
  const totalPages = estimateTotalPages(questions);

  // Helper to add footer
  const addFooter = () => {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    const footerY = pageHeight - 8;
    pdf.text(`${title} — Page ${pageNumber} of ${totalPages}`, margin, footerY);
  };

  // Helper to add new page
  const addNewPage = () => {
    addFooter();
    pdf.addPage();
    pageNumber++;
    currentY = margin;
  };

  // Helper to check if we need a new page
  const checkNewPage = (spaceBefore: number = 14) => {
    if (currentY + spaceBefore > pageHeight - 14) {
      addNewPage();
    }
  };

  // Helper to add wrapped text
  const addWrappedText = (
    text: string,
    fontSize: number,
    fontStyle: "normal" | "bold" = "normal",
    maxWidth: number = contentWidth,
    startX: number = margin
  ): number => {
    pdf.setFont("helvetica", fontStyle);
    pdf.setFontSize(fontSize);
    pdf.setTextColor(0, 0, 0);
    const lines = pdf.splitTextToSize(text, maxWidth);
    const lineHeight = fontSize * 0.353 * 1.3;
    pdf.text(lines, startX, currentY);
    const height = lines.length * lineHeight;
    currentY += height + 2;
    return height;
  };

  // === TITLE ===
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.setTextColor(0, 0, 0);
  const titleLines = pdf.splitTextToSize(title, contentWidth);
  pdf.text(titleLines, margin, currentY);
  currentY += titleLines.length * 7 + 4;

  // === DESCRIPTION ===
  if (description) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);
    const descLines = pdf.splitTextToSize(description, contentWidth);
    pdf.text(descLines, margin, currentY);
    currentY += descLines.length * 5.5 + 6;
  }

  // === WELCOME SECTION ===
  if (welcomeMessage) {
    checkNewPage(16);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Welcome", margin, currentY);
    currentY += 6;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(50, 50, 50);
    
    const welcomeLines = welcomeMessage.split("\n").filter((line) => line.trim());
    welcomeLines.forEach((line) => {
      const trimmedLine = line.replace(/^[•\-]\s*/, "").trim();
      if (trimmedLine) {
        checkNewPage(5);
        const wrappedLines = pdf.splitTextToSize(trimmedLine, contentWidth - 6);
        pdf.text("•", margin + 1, currentY);
        pdf.text(wrappedLines, margin + 6, currentY);
        currentY += wrappedLines.length * 4.5 + 1;
      }
    });
    currentY += 4;
  }

  // === QUESTIONS HEADER ===
  checkNewPage(12);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.text("Questions", margin, currentY);
  currentY += 8;

  // === QUESTIONS ===
  questions.forEach((question, index) => {
    checkNewPage(18);

    const isRequired = question.required ? " *" : "";
    const questionNumber = `${index + 1}.`;

    // Question text (left column)
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);

    const questionText = `${questionNumber} ${question.question}${isRequired}`;
    const qLines = pdf.splitTextToSize(questionText, leftColWidth - 4);
    pdf.text(qLines, margin, currentY);
    const qHeight = qLines.length * 4.8;

    // Answer area (right column) - starts at same Y as question
    const answerStartY = currentY;
    let answerY = answerStartY;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(20, 20, 20);

    // Render answer options
    if (
      question.options &&
      (question.type === "multiple_choice" ||
        question.type === "checkbox" ||
        question.type === "ranking")
    ) {
      question.options.forEach((option) => {
        const wrappedLines = pdf.splitTextToSize(option, rightColWidth - 8);
        
        // Draw checkbox
        const boxSize = 3.5;
        pdf.setDrawColor(100, 100, 100);
        pdf.setLineWidth(0.3);
        pdf.rect(rightColStart, answerY - 2.5, boxSize, boxSize);
        
        // Option text
        pdf.text(wrappedLines, rightColStart + 6, answerY);
        answerY += wrappedLines.length * 4 + 2;
      });
    } else if (question.type === "rating" || question.type === "nps") {
      // Horizontal rating scale
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      const scale = question.type === "nps" ? 10 : (question.ratingScale || 5);
      const labelLeft = question.type === "nps" ? "Not likely" : "Disagree";
      const labelRight = question.type === "nps" ? "Extremely likely" : "Agree";
      const boxSpacing = (rightColWidth - 20) / scale;
      
      // Draw rating boxes
      for (let i = 0; i <= scale; i++) {
        const x = rightColStart + i * boxSpacing;
        const boxSize = 3.5;
        pdf.setDrawColor(100, 100, 100);
        pdf.setLineWidth(0.3);
        pdf.rect(x, answerY - 2, boxSize, boxSize);
        
        // Number label
        pdf.setFontSize(8);
        pdf.text((i).toString(), x + 0.8, answerY + 5.5);
      }
      
      // Scale labels
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(labelLeft, rightColStart, answerY + 9.5);
      pdf.text(labelRight, rightColStart + rightColWidth - 15, answerY + 9.5);
      
      answerY += 16;
    } else if (question.type === "textarea" || question.type === "text") {
      // Draw lines for text input
      pdf.setDrawColor(150, 150, 150);
      pdf.setLineWidth(0.2);
      const lineSpacing = 5;
      const maxLines = question.type === "textarea" ? 4 : 2;
      
      for (let i = 0; i < maxLines; i++) {
        pdf.line(
          rightColStart,
          answerY + i * lineSpacing,
          pageWidth - margin,
          answerY + i * lineSpacing
        );
      }
      answerY += maxLines * lineSpacing + 2;
    } else if (question.type === "matrix" && question.rowLabels && question.colLabels) {
      // Matrix question
      pdf.setFontSize(8);
      const colWidth = (rightColWidth - 20) / question.colLabels.length;
      
      // Column headers
      question.colLabels.forEach((col, i) => {
        const x = rightColStart + 20 + i * colWidth;
        const wrappedCols = pdf.splitTextToSize(col, colWidth - 2);
        pdf.text(wrappedCols, x, answerY);
      });
      answerY += 5;
      
      // Rows with checkboxes
      question.rowLabels.forEach((row) => {
        const wrappedRows = pdf.splitTextToSize(row, 18);
        pdf.text(wrappedRows, rightColStart, answerY);
        
        question.colLabels?.forEach((col, i) => {
          const x = rightColStart + 20 + i * colWidth + colWidth / 2 - 1.75;
          const boxSize = 3.5;
          pdf.setDrawColor(100, 100, 100);
          pdf.setLineWidth(0.3);
          pdf.rect(x, answerY - 2.5, boxSize, boxSize);
        });
        
        answerY += wrappedRows.length * 4 + 3;
      });
    }

    // Move Y position based on whichever side is taller
    currentY = Math.max(currentY + qHeight, answerY) + 8;
  });

  // === THANK YOU SECTION ===
  checkNewPage(16);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text("Thank You", margin, currentY);
  currentY += 6;

  if (thankYouMessage) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(50, 50, 50);
    const tyLines = pdf.splitTextToSize(thankYouMessage, contentWidth);
    pdf.text(tyLines, margin, currentY);
  }

  // Add final footer
  addFooter();

  return pdf;
}

// Estimate total pages (rough calculation)
function estimateTotalPages(questions: Question[]): number {
  let estimatedHeight = 80; // Title, welcome, questions header
  
  questions.forEach((q) => {
    if (q.type === "textarea") {
      estimatedHeight += 30;
    } else if (q.options) {
      estimatedHeight += 15 + q.options.length * 6;
    } else {
      estimatedHeight += 18;
    }
  });
  
  estimatedHeight += 40; // Thank you section
  
  const pageHeight = 277; // 11" - margins
  return Math.ceil(estimatedHeight / pageHeight);
}

export function downloadPDF(pdf: jsPDF, fileName: string) {
  pdf.save(`${fileName}.pdf`);
}
