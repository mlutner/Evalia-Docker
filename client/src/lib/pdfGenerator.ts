import jsPDF from "jspdf";
import type { Question } from "@shared/schema";
import { getMergedConfig, PDF_CONFIG } from "./pdfConfig";

export async function generateSurveyPDF(
  title: string,
  description: string,
  questions: Question[],
  welcomeMessage: string,
  thankYouMessage: string,
  estimatedMinutes?: number,
  surveyType?: string
): Promise<jsPDF> {
  const config = getMergedConfig(surveyType);
  const pdf = new jsPDF();
  const pageWidth = config.page.width;
  const pageHeight = config.page.height;
  const { left: margin, right: marginRight, bottom: marginBottom } = config.margins;
  
  const contentWidth = pageWidth - margin - marginRight;
  const leftColWidth = contentWidth * config.layout.leftColumnPercentage;
  const rightColStart = margin + leftColWidth + config.layout.gapBetweenColumns;
  const rightColWidth = pageWidth - rightColStart - marginRight;

  let currentY = config.margins.top;
  let pageNumber = 1;
  const totalPages = estimateTotalPages(questions, config);

  // Helper to add footer
  const addFooter = () => {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(config.fonts.footer);
    pdf.setTextColor(...config.colors.footer);
    const footerY = pageHeight - 8;
    pdf.text(`${title} — Page ${pageNumber} of ${totalPages}`, margin, footerY);
  };

  // Helper to add new page
  const addNewPage = () => {
    addFooter();
    pdf.addPage();
    pageNumber++;
    currentY = config.margins.top + config.spacing.pageBreakBuffer;
  };

  // Helper to check if we need a new page
  const checkNewPage = (spaceBefore: number = 14) => {
    if (currentY + spaceBefore > pageHeight - marginBottom) {
      addNewPage();
    }
  };

  // Helper to render text
  const renderText = (
    text: string,
    x: number,
    y: number,
    fontSize: number,
    colorRGB: [number, number, number],
    fontStyle: "normal" | "bold" = "normal"
  ) => {
    pdf.setFont("helvetica", fontStyle);
    pdf.setFontSize(fontSize);
    pdf.setTextColor(colorRGB[0], colorRGB[1], colorRGB[2]);
    pdf.text(text, x, y);
  };

  // === TITLE ===
  renderText(title, margin, currentY, config.fonts.title, config.colors.title, "bold");
  currentY += 7 + config.spacing.titleBottom;

  // === DESCRIPTION ===
  if (description) {
    checkNewPage(config.spacing.descriptionBottom);
    const descLines = pdf.splitTextToSize(description, contentWidth);
    renderText("", margin, currentY, config.fonts.description, config.colors.description);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(config.fonts.description);
    pdf.setTextColor(...config.colors.description);
    pdf.text(descLines, margin, currentY);
    currentY += descLines.length * 5.5 + config.spacing.descriptionBottom;
  }

  // === WELCOME SECTION ===
  if (welcomeMessage) {
    checkNewPage(16);
    renderText("Welcome", margin, currentY, config.fonts.sectionHeader, config.colors.headings, "bold");
    currentY += 6;

    const welcomeLines = welcomeMessage.split("\n").filter((line) => line.trim());
    welcomeLines.forEach((line) => {
      const trimmedLine = line.replace(/^[•\-]\s*/, "").trim();
      if (trimmedLine) {
        checkNewPage(5);
        const wrappedLines = pdf.splitTextToSize(trimmedLine, contentWidth - 6);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(config.fonts.bodyText);
        pdf.setTextColor(...config.colors.bodyText);
        pdf.text("•", margin + 1, currentY);
        pdf.text(wrappedLines, margin + 6, currentY);
        currentY += wrappedLines.length * config.fonts.bodyText * config.spacing.lineHeight * 0.353 + config.spacing.betweenOptions;
      }
    });
    currentY += config.spacing.sectionHeaderBottom;
  }

  // === QUESTIONS HEADER ===
  checkNewPage(12);
  renderText("Questions", margin, currentY, config.fonts.sectionHeader, config.colors.headings, "bold");
  currentY += 8;

  // === QUESTIONS ===
  questions.forEach((question, index) => {
    checkNewPage(18);

    const isRequired = question.required ? " *" : "";
    const questionNumber = `${index + 1}.`;
    const questionText = `${questionNumber} ${question.question}${isRequired}`;

    // Question text (left column)
    const qLines = pdf.splitTextToSize(questionText, leftColWidth - 4);
    
    if (isRequired) {
      // Split to handle required asterisk differently
      const withoutAsterisk = `${questionNumber} ${question.question}`;
      const lines = pdf.splitTextToSize(withoutAsterisk, leftColWidth - 4);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(config.fonts.questionText);
      pdf.setTextColor(config.colors.questionText[0], config.colors.questionText[1], config.colors.questionText[2]);
      pdf.text(lines, margin, currentY);
      
      // Add asterisk
      pdf.setTextColor(config.colors.required[0], config.colors.required[1], config.colors.required[2]);
      if (lines.length > 0) {
        const lastLine = lines[lines.length - 1];
        pdf.text(" *", margin + pdf.getTextWidth(lastLine), currentY + (lines.length - 1) * 5);
      }
      currentY += lines.length * config.fonts.questionText * config.spacing.lineHeight * 0.353;
    } else {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(config.fonts.questionText);
      pdf.setTextColor(config.colors.questionText[0], config.colors.questionText[1], config.colors.questionText[2]);
      pdf.text(qLines, margin, currentY);
      currentY += qLines.length * config.fonts.questionText * config.spacing.lineHeight * 0.353;
    }

    // Answer area (right column)
    const answerStartY = currentY - (qLines.length * config.fonts.questionText * config.spacing.lineHeight * 0.353);
    let answerY = answerStartY + config.spacing.beforeAnswerArea;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(config.fonts.answerOption);
    pdf.setTextColor(...config.colors.answerText);

    // Render answer options based on question type
    if (
      question.options &&
      (question.type === "multiple_choice" ||
        question.type === "checkbox" ||
        question.type === "ranking")
    ) {
      question.options.forEach((option) => {
        const wrappedLines = pdf.splitTextToSize(option, rightColWidth - 8);
        
        // Draw checkbox
        const boxSize = config.elements.checkboxSize;
        pdf.setDrawColor(config.colors.borders[0], config.colors.borders[1], config.colors.borders[2]);
        pdf.setLineWidth(config.lineWeights.checkbox);
        pdf.rect(rightColStart, answerY - 2.5, boxSize, boxSize);
        
        // Option text
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(config.fonts.answerOption);
        pdf.setTextColor(config.colors.answerText[0], config.colors.answerText[1], config.colors.answerText[2]);
        pdf.text(wrappedLines, rightColStart + 6, answerY);
        answerY += wrappedLines.length * config.fonts.answerOption * config.spacing.lineHeight * 0.353 + config.spacing.betweenOptions;
      });
    } else if (question.type === "rating" || question.type === "nps") {
      // Horizontal rating scale
      const scale = question.type === "nps" ? 10 : (question.ratingScale || 5);
      const labelLeft = question.type === "nps" ? "Not likely" : "Disagree";
      const labelRight = question.type === "nps" ? "Extremely likely" : "Agree";
      const boxSpacing = (rightColWidth - 20) / scale;
      
      // Draw rating boxes
      for (let i = 0; i <= scale; i++) {
        const x = rightColStart + i * boxSpacing;
        const boxSize = config.elements.ratingBoxSize;
        pdf.setDrawColor(config.colors.borders[0], config.colors.borders[1], config.colors.borders[2]);
        pdf.setLineWidth(config.lineWeights.checkbox);
        pdf.rect(x, answerY - 2, boxSize, boxSize);
        
        // Number label
        pdf.setFontSize(config.fonts.answerLabel);
        pdf.setTextColor(config.colors.answerLabels[0], config.colors.answerLabels[1], config.colors.answerLabels[2]);
        pdf.text((i).toString(), x + 0.8, answerY + 5.5);
      }
      
      // Scale labels
      pdf.setFontSize(config.fonts.answerLabel);
      pdf.setTextColor(config.colors.answerLabels[0], config.colors.answerLabels[1], config.colors.answerLabels[2]);
      pdf.text(labelLeft, rightColStart, answerY + 9.5);
      pdf.text(labelRight, rightColStart + rightColWidth - 15, answerY + 9.5);
      
      answerY += 16;
    } else if (question.type === "textarea" || question.type === "text") {
      // Draw lines for text input
      pdf.setDrawColor(config.colors.borders[0], config.colors.borders[1], config.colors.borders[2]);
      pdf.setLineWidth(config.lineWeights.textLine);
      const lineSpacing = config.elements.textLineHeight;
      const maxLines = question.type === "textarea" ? config.elements.textLinesTextarea : config.elements.textLinesDefault;
      
      for (let i = 0; i < maxLines; i++) {
        pdf.line(
          rightColStart,
          answerY + i * lineSpacing,
          pageWidth - marginRight,
          answerY + i * lineSpacing
        );
      }
      answerY += maxLines * lineSpacing + 2;
    } else if (question.type === "matrix" && question.rowLabels && question.colLabels) {
      // Matrix question
      pdf.setFontSize(config.fonts.answerLabel);
      const colWidth = (rightColWidth - 20) / question.colLabels.length;
      
      // Column headers
      question.colLabels.forEach((col, i) => {
        const x = rightColStart + 20 + i * colWidth;
        const wrappedCols = pdf.splitTextToSize(col, colWidth - 2);
        pdf.setTextColor(config.colors.answerLabels[0], config.colors.answerLabels[1], config.colors.answerLabels[2]);
        pdf.text(wrappedCols, x, answerY);
      });
      answerY += 5;
      
      // Rows with checkboxes
      question.rowLabels.forEach((row) => {
        const wrappedRows = pdf.splitTextToSize(row, 18);
        pdf.setTextColor(config.colors.answerText[0], config.colors.answerText[1], config.colors.answerText[2]);
        pdf.text(wrappedRows, rightColStart, answerY);
        
        question.colLabels?.forEach((col, i) => {
          const x = rightColStart + 20 + i * colWidth + colWidth / 2 - 1.75;
          const boxSize = config.elements.matrixCellSize;
          pdf.setDrawColor(config.colors.borders[0], config.colors.borders[1], config.colors.borders[2]);
          pdf.setLineWidth(config.lineWeights.checkbox);
          pdf.rect(x, answerY - 2.5, boxSize, boxSize);
        });
        
        answerY += wrappedRows.length * config.fonts.answerLabel * 0.353 + 3;
      });
    }

    // Move Y position based on content
    currentY = Math.max(currentY, answerY) + config.spacing.betweenQuestions;
  });

  // === THANK YOU SECTION ===
  checkNewPage(16);
  renderText("Thank You", margin, currentY, config.fonts.sectionHeader, config.colors.headings, "bold");
  currentY += 6;

  if (thankYouMessage) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(config.fonts.bodyText);
    pdf.setTextColor(...config.colors.bodyText);
    const tyLines = pdf.splitTextToSize(thankYouMessage, contentWidth);
    pdf.text(tyLines, margin, currentY);
  }

  // Add final footer
  addFooter();

  return pdf;
}

// Estimate total pages
function estimateTotalPages(questions: Question[], config: any): number {
  let estimatedHeight = 80;
  
  questions.forEach((q) => {
    if (q.type === "textarea") {
      estimatedHeight += 35;
    } else if (q.options) {
      estimatedHeight += 15 + q.options.length * 6;
    } else if (q.type === "rating" || q.type === "nps") {
      estimatedHeight += 20;
    } else {
      estimatedHeight += 18;
    }
  });
  
  estimatedHeight += 40;
  
  const usablePageHeight = config.page.height - config.margins.top - config.margins.bottom;
  return Math.ceil(estimatedHeight / usablePageHeight);
}

export function downloadPDF(pdf: jsPDF, fileName: string) {
  pdf.save(`${fileName}.pdf`);
}
