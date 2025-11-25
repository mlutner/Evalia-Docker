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
  const margin = 16;
  const contentWidth = pageWidth - 2 * margin;
  let currentY = margin;

  // Helper function to check if we need a new page
  const checkNewPage = (spaceBefore: number = 12) => {
    if (currentY + spaceBefore > pageHeight - margin) {
      pdf.addPage();
      currentY = margin;
    }
  };

  // Helper function to add text with word wrapping
  const addWrappedText = (
    text: string,
    fontSize: number,
    fontStyle: "normal" | "bold" = "normal",
    maxWidth: number = contentWidth,
    lineSpacing: number = 1.4
  ) => {
    pdf.setFontSize(fontSize);
    pdf.setFont("helvetica", fontStyle);
    const lines = pdf.splitTextToSize(text, maxWidth);
    const lineHeight = fontSize * 0.353 * lineSpacing; // Convert to mm with spacing
    const requiredHeight = lines.length * lineHeight;

    checkNewPage(requiredHeight + 2);

    pdf.text(lines, margin, currentY);
    currentY += requiredHeight + 2;
  };

  // Title
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.setTextColor(20, 20, 20);
  const titleLines = pdf.splitTextToSize(title, contentWidth);
  pdf.text(titleLines, margin, currentY);
  currentY += titleLines.length * 8 + 4;

  // Estimated time
  if (estimatedMinutes) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(120, 120, 120);
    addWrappedText(`Estimated time: ${estimatedMinutes} minutes`, 10, "normal", contentWidth, 1.2);
    currentY += 2;
  }

  // Description
  if (description) {
    checkNewPage(12);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(60, 60, 60);
    const descLines = pdf.splitTextToSize(description, contentWidth);
    pdf.text(descLines, margin, currentY);
    currentY += descLines.length * 5.5 + 6;
  }

  // Welcome message section
  if (welcomeMessage) {
    checkNewPage(18);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Welcome", margin, currentY);
    currentY += 7;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(80, 80, 80);

    // Handle welcome message - split by line breaks and format as bullets
    const welcomeLines = welcomeMessage.split("\n").filter((line) => line.trim());
    welcomeLines.forEach((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine) {
        checkNewPage(6);
        const wrappedLines = pdf.splitTextToSize(trimmedLine, contentWidth - 8);
        pdf.text("•", margin + 2, currentY);
        pdf.text(wrappedLines, margin + 8, currentY);
        currentY += wrappedLines.length * 4.5 + 1;
      }
    });
    currentY += 4;
  }

  // Questions header
  checkNewPage(12);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  pdf.setTextColor(0, 0, 0);
  pdf.text("Questions", margin, currentY);
  currentY += 9;

  // Questions
  questions.forEach((question, index) => {
    checkNewPage(18);

    // Question number and text
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    const questionPrefix = `${index + 1}. `;
    const questionLines = pdf.splitTextToSize(
      questionPrefix + question.question,
      contentWidth - 5
    );
    pdf.text(questionLines, margin, currentY);
    currentY += questionLines.length * 5 + 3;

    // Question type and required indicator on same line
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(110, 110, 110);
    let typeLabel = question.type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    if (question.type === "multiple_choice") {
      typeLabel = "Multiple Choice";
    } else if (question.type === "checkbox") {
      typeLabel = "Checkbox (Select Multiple)";
    } else if (question.type === "rating") {
      typeLabel = "Rating Scale";
    } else if (question.type === "nps") {
      typeLabel = "NPS Scale";
    } else if (question.type === "matrix") {
      typeLabel = "Matrix Question";
    } else if (question.type === "ranking") {
      typeLabel = "Ranking";
    } else if (question.type === "textarea") {
      typeLabel = "Text Area";
    } else if (question.type === "text") {
      typeLabel = "Text Input";
    }

    let typeText = `[${typeLabel}]`;
    if (question.required) {
      typeText += " *Required";
      pdf.setTextColor(200, 20, 20);
    }
    pdf.text(typeText, margin + 2, currentY);
    currentY += 5;

    // Options for choice-based questions
    if (
      question.options &&
      (question.type === "multiple_choice" ||
        question.type === "checkbox" ||
        question.type === "ranking")
    ) {
      checkNewPage(question.options.length * 5 + 4);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(70, 70, 70);

      question.options.forEach((option) => {
        const wrappedLines = pdf.splitTextToSize(option, contentWidth - 12);
        pdf.text("○", margin + 5, currentY);
        pdf.text(wrappedLines, margin + 11, currentY);
        currentY += wrappedLines.length * 4.2 + 1;
      });
      currentY += 2;
    }

    // Rating scale info
    if (question.type === "rating" || question.type === "nps") {
      checkNewPage(6);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      const scale =
        question.type === "nps"
          ? "0 – 10 (0 = Not likely, 10 = Extremely likely)"
          : `1 – ${question.ratingScale || 5}`;
      pdf.text(`Scale: ${scale}`, margin + 5, currentY);
      currentY += 5;
    }

    // Matrix question details
    if (question.type === "matrix" && question.rowLabels && question.colLabels) {
      checkNewPage(10);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Rows: ${question.rowLabels.join(", ")}`, margin + 5, currentY);
      currentY += 4;
      pdf.text(`Columns: ${question.colLabels.join(", ")}`, margin + 5, currentY);
      currentY += 5;
    }

    currentY += 6;
  });

  // Thank you message section
  if (thankYouMessage) {
    checkNewPage(18);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Thank You", margin, currentY);
    currentY += 7;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(80, 80, 80);
    const thankYouLines = pdf.splitTextToSize(thankYouMessage, contentWidth);
    pdf.text(thankYouLines, margin, currentY);
    currentY += thankYouLines.length * 5 + 2;
  }

  return pdf;
}

export function downloadPDF(pdf: jsPDF, fileName: string) {
  pdf.save(`${fileName}.pdf`);
}
