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
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let currentY = margin;

  // Helper function to check if we need a new page
  const checkNewPage = (spaceBefore: number = 10) => {
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
    maxWidth: number = contentWidth
  ) => {
    pdf.setFontSize(fontSize);
    pdf.setFont("helvetica", fontStyle);
    const lines = pdf.splitTextToSize(text, maxWidth);
    const lineHeight = fontSize * 0.353; // Convert to mm
    const requiredHeight = lines.length * lineHeight;

    checkNewPage(requiredHeight);

    pdf.text(lines, margin, currentY);
    currentY += requiredHeight + 2;
  };

  // Title
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.setTextColor(0, 0, 0);
  const titleLines = pdf.splitTextToSize(title, contentWidth);
  pdf.text(titleLines, margin, currentY);
  currentY += titleLines.length * 7 + 5;

  // Estimated time
  if (estimatedMinutes) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    addWrappedText(`Estimated time: ${estimatedMinutes} minutes`, 10);
  }

  // Description
  if (description) {
    checkNewPage(10);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(50, 50, 50);
    addWrappedText(description, 11);
    currentY += 3;
  }

  // Welcome message
  if (welcomeMessage) {
    checkNewPage(15);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Welcome", margin, currentY);
    currentY += 6;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(80, 80, 80);
    addWrappedText(welcomeMessage, 10);
  }

  // Questions header
  checkNewPage(10);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.text("Questions", margin, currentY);
  currentY += 8;

  // Questions
  questions.forEach((question, index) => {
    checkNewPage(15);

    // Question number and text
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    const questionPrefix = `${index + 1}. `;
    const questionLines = pdf.splitTextToSize(
      questionPrefix + question.question,
      contentWidth - 5
    );
    pdf.text(questionLines, margin + 3, currentY);
    currentY += questionLines.length * 5 + 2;

    // Question type badge
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    let typeLabel = question.type.replace(/_/g, " ");
    if (question.type === "multiple_choice" || question.type === "checkbox") {
      typeLabel += question.type === "checkbox" ? " (select multiple)" : " (select one)";
    }
    pdf.text(`[${typeLabel}]`, margin + 5, currentY);
    currentY += 5;

    // Options for choice-based questions
    if (
      question.options &&
      (question.type === "multiple_choice" ||
        question.type === "checkbox" ||
        question.type === "ranking")
    ) {
      checkNewPage(question.options.length * 4 + 5);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(60, 60, 60);

      question.options.forEach((option, optIndex) => {
        const optionText = `${String.fromCharCode(10625)} ${option}`;
        const optionLines = pdf.splitTextToSize(optionText, contentWidth - 10);
        pdf.text(optionLines, margin + 8, currentY);
        currentY += optionLines.length * 4 + 1;
      });
      currentY += 2;
    }

    // Rating scale
    if (
      question.type === "rating" ||
      question.type === "nps"
    ) {
      checkNewPage(8);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(80, 80, 80);
      const scale =
        question.type === "nps"
          ? "0 - 10 (where 0 = not at all likely, 10 = extremely likely)"
          : `1 - ${question.ratingScale || 5}`;
      pdf.text(`Scale: ${scale}`, margin + 5, currentY);
      currentY += 5;
    }

    // Matrix question
    if (question.type === "matrix" && question.rowLabels && question.colLabels) {
      checkNewPage(
        question.rowLabels.length * 5 + question.colLabels.length * 2 + 10
      );
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(80, 80, 80);
      pdf.text("Rows: " + question.rowLabels.join(", "), margin + 5, currentY);
      currentY += 4;
      pdf.text("Columns: " + question.colLabels.join(", "), margin + 5, currentY);
      currentY += 5;
    }

    // Required indicator
    if (question.required) {
      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(9);
      pdf.setTextColor(200, 0, 0);
      pdf.text("* Required", margin + 5, currentY);
      currentY += 4;
    }

    currentY += 3;
  });

  // Thank you message
  if (thankYouMessage) {
    checkNewPage(15);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Thank You", margin, currentY);
    currentY += 6;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(80, 80, 80);
    addWrappedText(thankYouMessage, 10);
  }

  return pdf;
}

export function downloadPDF(pdf: jsPDF, fileName: string) {
  pdf.save(`${fileName}.pdf`);
}
