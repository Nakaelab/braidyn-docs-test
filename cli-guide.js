document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".copy-button");

  buttons.forEach((button) => {
    button.addEventListener("click", async () => {
      const targetId = button.getAttribute("data-copy-target");
      const target = document.getElementById(targetId);

      if (!target) return;

      const text = target.innerText.trim();

      try {
        await navigator.clipboard.writeText(text);
        const originalText = button.textContent;
        button.textContent = "Copied";
        button.classList.add("copied");

        setTimeout(() => {
          button.textContent = originalText;
          button.classList.remove("copied");
        }, 1600);
      } catch (error) {
        button.textContent = "Failed";
        setTimeout(() => {
          button.textContent = "Copy";
        }, 1600);
      }
    });
  });
});