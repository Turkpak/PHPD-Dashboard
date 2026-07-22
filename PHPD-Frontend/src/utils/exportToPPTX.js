const BRAND = {
  darkGreen: "054332",
  green: "2F8F6C",
  lightGreen: "EAF5F0",
  white: "FFFFFF",
  text: "1F2937",
  muted: "667085",
  border: "D7E5DE",
  amber: "F59E0B",
  red: "EF4444",
};

const clampPercentage = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(100, parsed));
};

const safeFileName = (value) =>
  String(value || "PHPD Dashboard")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, " ")
    .trim();

const getProgressColor = (percentage) => {
  if (percentage >= 80) return BRAND.green;
  if (percentage >= 50) return BRAND.amber;
  return BRAND.red;
};

const calculateOverallProgress = (cityData, phases) => {
  const explicitOverall = Number(cityData?.overall);
  if (Number.isFinite(explicitOverall)) {
    return clampPercentage(explicitOverall);
  }

  if (!phases.length) return 0;
  const total = phases.reduce(
    (sum, phase) => sum + clampPercentage(phase?.percentage),
    0,
  );
  return total / phases.length;
};

const addHeader = (slide, pptx, title, subtitle) => {
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 0.78,
    line: { color: BRAND.darkGreen, transparency: 100 },
    fill: { color: BRAND.darkGreen },
  });

  slide.addText(title, {
    x: 0.5,
    y: 0.15,
    w: 8.8,
    h: 0.34,
    fontFace: "Aptos Display",
    fontSize: 20,
    bold: true,
    color: BRAND.white,
    margin: 0,
  });

  if (subtitle) {
    slide.addText(subtitle, {
      x: 9.2,
      y: 0.2,
      w: 3.6,
      h: 0.24,
      fontFace: "Aptos",
      fontSize: 9,
      color: "D6EEE4",
      align: "right",
      margin: 0,
    });
  }
};

/**
 * Export the currently selected PHPD dashboard scope to PowerPoint.
 *
 * The dependency is loaded only when the user clicks Export Operation,
 * keeping pptxgenjs out of the dashboard's initial JavaScript bundle.
 */
export async function exportDashboardToPPTX({
  cityName,
  cityData = {},
  installationPhases = [],
}) {
  const { default: PptxGenJS } = await import("pptxgenjs");

  const phases = Array.isArray(installationPhases)
    ? installationPhases.map((phase, index) => ({
        key: phase?.key ?? `phase-${index + 1}`,
        title: String(phase?.title ?? `Phase ${index + 1}`),
        percentage: clampPercentage(phase?.percentage),
      }))
    : [];

  const scopeName = safeFileName(cityName || "PHPD Dashboard");
  const overallProgress = calculateOverallProgress(cityData, phases);
  const generatedAt = new Date();
  const generatedLabel = generatedAt.toLocaleString("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Punjab Health and Population Department";
  pptx.company = "Punjab Health and Population Department";
  pptx.subject = `${scopeName} dashboard progress`;
  pptx.title = `${scopeName} Dashboard`;
  pptx.lang = "en-PK";
  pptx.theme = {
    headFontFace: "Aptos Display",
    bodyFontFace: "Aptos",
    lang: "en-PK",
  };

  // Slide 1: executive summary
  {
    const slide = pptx.addSlide();
    slide.background = { color: "F7FAF8" };
    addHeader(slide, pptx, "PHPD Project Dashboard", generatedLabel);

    slide.addText(scopeName, {
      x: 0.62,
      y: 1.12,
      w: 8.6,
      h: 0.65,
      fontFace: "Aptos Display",
      fontSize: 30,
      bold: true,
      color: BRAND.darkGreen,
      margin: 0,
      breakLine: false,
    });

    slide.addText("Progress and operational overview", {
      x: 0.65,
      y: 1.88,
      w: 5.5,
      h: 0.3,
      fontFace: "Aptos",
      fontSize: 14,
      color: BRAND.muted,
      margin: 0,
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 9.45,
      y: 1.1,
      w: 3.2,
      h: 2.15,
      rectRadius: 0.08,
      fill: { color: BRAND.white },
      line: { color: BRAND.border, width: 1 },
      shadow: {
        type: "outer",
        color: "AAB8B1",
        opacity: 0.18,
        blur: 1,
        angle: 45,
        distance: 1,
      },
    });

    slide.addText("OVERALL PROGRESS", {
      x: 9.75,
      y: 1.48,
      w: 2.6,
      h: 0.25,
      fontFace: "Aptos",
      fontSize: 11,
      bold: true,
      color: BRAND.muted,
      align: "center",
      margin: 0,
    });

    slide.addText(`${overallProgress.toFixed(2)}%`, {
      x: 9.72,
      y: 1.86,
      w: 2.65,
      h: 0.62,
      fontFace: "Aptos Display",
      fontSize: 34,
      bold: true,
      color: getProgressColor(overallProgress),
      align: "center",
      margin: 0,
    });

    slide.addShape(pptx.ShapeType.rect, {
      x: 9.85,
      y: 2.68,
      w: 2.38,
      h: 0.16,
      fill: { color: "E7EEE9" },
      line: { color: "E7EEE9", transparency: 100 },
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: 9.85,
      y: 2.68,
      w: 2.38 * (overallProgress / 100),
      h: 0.16,
      fill: { color: getProgressColor(overallProgress) },
      line: { color: getProgressColor(overallProgress), transparency: 100 },
    });

    slide.addText("Installation phases", {
      x: 0.65,
      y: 2.72,
      w: 4,
      h: 0.35,
      fontFace: "Aptos Display",
      fontSize: 18,
      bold: true,
      color: BRAND.text,
      margin: 0,
    });

    const displayPhases = phases.slice(0, 8);
    displayPhases.forEach((phase, index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      const x = 0.65 + column * 6.15;
      const y = 3.25 + row * 0.83;

      slide.addText(phase.title, {
        x,
        y,
        w: 4.55,
        h: 0.24,
        fontFace: "Aptos",
        fontSize: 11,
        bold: true,
        color: BRAND.text,
        margin: 0,
        breakLine: false,
      });

      slide.addText(`${phase.percentage.toFixed(2)}%`, {
        x: x + 4.7,
        y,
        w: 0.85,
        h: 0.24,
        fontFace: "Aptos",
        fontSize: 10,
        bold: true,
        color: getProgressColor(phase.percentage),
        align: "right",
        margin: 0,
      });

      slide.addShape(pptx.ShapeType.rect, {
        x,
        y: y + 0.36,
        w: 5.55,
        h: 0.12,
        fill: { color: "E5ECE8" },
        line: { color: "E5ECE8", transparency: 100 },
      });

      slide.addShape(pptx.ShapeType.rect, {
        x,
        y: y + 0.36,
        w: 5.55 * (phase.percentage / 100),
        h: 0.12,
        fill: { color: getProgressColor(phase.percentage) },
        line: {
          color: getProgressColor(phase.percentage),
          transparency: 100,
        },
      });
    });

    if (!displayPhases.length) {
      slide.addText("No installation phase data is available for this selection.", {
        x: 0.65,
        y: 3.35,
        w: 7,
        h: 0.4,
        fontFace: "Aptos",
        fontSize: 13,
        color: BRAND.muted,
        margin: 0,
      });
    }
  }

  // Slide 2: phase chart and table
  if (phases.length) {
    const slide = pptx.addSlide();
    slide.background = { color: "F7FAF8" };
    addHeader(slide, pptx, "Installation Phase Progress", scopeName);

    slide.addChart(
      pptx.ChartType.bar,
      [
        {
          name: "Progress",
          labels: phases.map((phase) => phase.title),
          values: phases.map((phase) => Number(phase.percentage.toFixed(2))),
        },
      ],
      {
        x: 0.6,
        y: 1.15,
        w: 7.55,
        h: 5.65,
        catAxisLabelFontFace: "Aptos",
        catAxisLabelFontSize: 10,
        valAxisLabelFontFace: "Aptos",
        valAxisLabelFontSize: 10,
        valAxisMinVal: 0,
        valAxisMaxVal: 100,
        valAxisMajorUnit: 20,
        showLegend: false,
        showTitle: false,
        showValue: true,
        showCatName: false,
        showPercent: false,
        showBorder: false,
        chartColors: [BRAND.green],
        gridLine: { color: "DDE7E2", width: 1 },
      },
    );

    const rows = [
      [
        { text: "Phase", options: { bold: true, color: BRAND.white } },
        { text: "Progress", options: { bold: true, color: BRAND.white } },
        { text: "Status", options: { bold: true, color: BRAND.white } },
      ],
      ...phases.map((phase) => [
        phase.title,
        `${phase.percentage.toFixed(2)}%`,
        phase.percentage >= 100
          ? "Completed"
          : phase.percentage >= 80
            ? "Near Complete"
            : phase.percentage > 0
              ? "In Progress"
              : "Not Started",
      ]),
    ];

    slide.addTable(rows, {
      x: 8.45,
      y: 1.15,
      w: 4.3,
      h: 5.65,
      border: { type: "solid", color: BRAND.border, width: 0.7 },
      fill: BRAND.white,
      color: BRAND.text,
      fontFace: "Aptos",
      fontSize: 9,
      margin: 0.07,
      rowH: 0.32,
      colW: [2.25, 0.85, 1.2],
      autoFit: false,
      bold: false,
      valign: "mid",
      breakLine: false,
      fillHeader: BRAND.darkGreen,
    });
  }

  const outputName = `${scopeName} - PHPD Dashboard.pptx`;
  await pptx.writeFile({ fileName: outputName });
}
