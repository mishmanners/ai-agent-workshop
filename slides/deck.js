const slides = [...document.querySelectorAll(".slide")];
const progress = document.querySelector(".progress span");
const exportPdfButton = document.querySelector(".export-pdf-button");
const params = new URLSearchParams(window.location.search);
let current = Number(params.get("slide") || 1) - 1;

function showSlide(index) {
  current = Math.max(0, Math.min(index, slides.length - 1));
  slides.forEach((slide, i) => {
    slide.classList.toggle("active", i === current);
  });
  progress.style.setProperty(
    "--progress",
    `${((current + 1) / slides.length) * 100}%`,
  );
  history.replaceState(null, "", `?slide=${current + 1}`);
}

function move(dir) {
  showSlide(current + dir);
}

document.addEventListener("keydown", (event) => {
  if (["ArrowRight", "PageDown", " "].includes(event.key)) move(1);
  if (["ArrowLeft", "PageUp"].includes(event.key)) move(-1);
  if (event.key === "Home") showSlide(0);
  if (event.key === "End") showSlide(slides.length - 1);
});

document.querySelectorAll("button[data-dir]").forEach((button) => {
  button.addEventListener("click", () => move(Number(button.dataset.dir)));
});

if (exportPdfButton) {
  exportPdfButton.addEventListener("click", () => {
    document.body.classList.add("exporting-pdf");
    window.print();
  });
}

window.addEventListener("afterprint", () => {
  document.body.classList.remove("exporting-pdf");
});

showSlide(current);
