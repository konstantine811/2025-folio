import { toPng } from "html-to-image";

export const exportSvgToPng = (
  svgElement: SVGSVGElement,
  fileName = "logo.png"
) => {
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = svgElement.clientWidth;
    canvas.height = svgElement.clientHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(image, 0, 0);
    URL.revokeObjectURL(url);

    const pngUrl = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.download = fileName;
    link.href = pngUrl;
    link.click();
  };

  image.src = url;
};

export const exportHtmlToPng = (node: HTMLElement, fileName = "export.png") => {
  toPng(node)
    .then((dataUrl) => {
      const link = document.createElement("a");
      link.download = fileName;
      link.href = dataUrl;
      link.click();
    })
    .catch((err) => {
      console.error("❌ Failed to export PNG", err);
    });
};

export const exportSvgToFile = (
  svgEl: SVGSVGElement,
  filename = "logo.svg"
) => {
  const svgData = new XMLSerializer().serializeToString(svgEl);
  const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
