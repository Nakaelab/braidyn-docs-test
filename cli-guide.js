document.addEventListener("DOMContentLoaded", () => {
  /* ── Copy button logic ── */
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
        setTimeout(() => { button.innerHTML = originalHTML; }, 1600);
      }
    });
  });

  /* ── Download selector logic ── */

  const BUCKET = "s3://braidyn-bc-buckets";

  // Session-type labels for descriptions
  const SESSION_LABELS = {
    "all":            "all sessions",
    "resting-state":  "resting-state sessions",
    "task":           "task sessions",
    "sensory-stim":   "sensory-stim sessions",
  };

  function buildDescription(session, filetype, scope) {
    const sessionText = SESSION_LABELS[session];
    const fileText    = filetype === "nwb" ? "NWB (.nwb) files" : "all file types";
    const scopeText   = scope === "subject" ? "the specified subject" : "all subjects";
    return `Download ${fileText} from ${sessionText} for ${scopeText}.`;
  }

  function buildCommand(session, filetype, scope, subjectName) {
    const name = subjectName.trim() || "sub-VG1-GC#105";

    // Source & destination
    let src, dst;
    if (scope === "subject") {
      src = `"${BUCKET}/${name}"`;
      dst = `"./data/${name}"`;
    } else {
      src = `${BUCKET}`;
      dst = `./data/`;
    }

    const flags = ["--no-sign-request"];

    // Build --exclude / --include filters
    const hasSession = session !== "all";
    const hasNwb     = filetype === "nwb";

    if (hasSession && hasNwb) {
      // e.g. resting-state + NWB only
      flags.push('--exclude "*"', `--include "*${session}*.nwb"`);
    } else if (hasSession) {
      // e.g. resting-state + all files
      flags.push('--exclude "*"', `--include "*${session}*"`);
    } else if (hasNwb) {
      // all sessions + NWB only
      flags.push('--exclude "*"', '--include "*.nwb"');
    }
    // else: all sessions + all files → no filters

    return `aws s3 sync ${src} ${dst} ${flags.join(" ")}`;
  }

  function initSelector(selectorId, codeId, descId, subjectAreaId, subjectInputId) {
    const selector = document.getElementById(selectorId);
    if (!selector) return;

    const sessionPills = selector.querySelector('[data-role="session"]');
    const ftPills      = selector.querySelector('[data-role="filetype"]');
    const scopePills   = selector.querySelector('[data-role="scope"]');
    const codeEl       = document.getElementById(codeId);
    const descEl       = document.getElementById(descId);
    const subjectArea  = document.getElementById(subjectAreaId);
    const subjectInput = document.getElementById(subjectInputId);

    let activeSession  = "all";
    let activeFiletype = "all-files";
    let activeScope    = "all";

    function update() {
      descEl.textContent  = buildDescription(activeSession, activeFiletype, activeScope);
      codeEl.textContent  = buildCommand(activeSession, activeFiletype, activeScope,
                                          subjectInput ? subjectInput.value : "");
      if (subjectArea) {
        subjectArea.style.display = activeScope === "subject" ? "block" : "none";
      }
    }

    function wirePills(container, setter) {
      if (!container) return;
      container.querySelectorAll(".pill").forEach((pill) => {
        pill.addEventListener("click", () => {
          container.querySelectorAll(".pill").forEach((p) => p.classList.remove("active"));
          pill.classList.add("active");
          setter(pill.getAttribute("data-value"));
          update();
        });
      });
    }

    wirePills(sessionPills, (v) => { activeSession  = v; });
    wirePills(ftPills,      (v) => { activeFiletype = v; });
    wirePills(scopePills,   (v) => { activeScope    = v; });

    // Live-update on subject name input
    if (subjectInput) {
      subjectInput.addEventListener("input", () => {
        if (activeScope === "subject") update();
      });
    }
  }

  // Initialise both selectors
  initSelector("selector-local", "code-generated-local", "desc-local",
                "subject-input-local", "subject-name-local");
  initSelector("selector-ec2",   "code-generated-ec2",   "desc-ec2",
                "subject-input-ec2",   "subject-name-ec2");
});