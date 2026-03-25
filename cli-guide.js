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
        const originalHTML = button.innerHTML;
        button.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        button.classList.add("copied");

        setTimeout(() => {
          button.innerHTML = originalHTML;
          button.classList.remove("copied");
        }, 1600);
      } catch (error) {
        const originalHTML = button.innerHTML;
        button.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        setTimeout(() => {
          button.innerHTML = originalHTML;
        }, 1600);
      }
    });
  });
});