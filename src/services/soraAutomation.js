const puppeteer = require("puppeteer");
const fs = require("fs-extra");
const path = require("path");
const os = require("os");
const EventEmitter = require("events");

/** Get Chrome/Chromium executable path for current platform. Returns undefined to use Puppeteer's bundled Chromium if not found. */
function getChromeExecutablePath() {
  const platform = process.platform;
  const paths = {
    darwin: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    win32: [
      path.join(
        process.env.PROGRAMFILES || "C:\\Program Files",
        "Google\\Chrome\\Application\\chrome.exe",
      ),
      path.join(
        process.env["PROGRAMFILES(X86)"] || "C:\\Program Files (x86)",
        "Google\\Chrome\\Application\\chrome.exe",
      ),
      path.join(
        process.env.LOCALAPPDATA || "",
        "Google\\Chrome\\Application\\chrome.exe",
      ),
    ],
    linux: [
      "/usr/bin/google-chrome",
      "/usr/bin/chromium",
      "/usr/bin/chromium-browser",
    ],
  };
  if (platform === "darwin" && fs.existsSync(paths.darwin)) return paths.darwin;
  if (platform === "win32") {
    for (const p of paths.win32) {
      if (p && fs.existsSync(p)) return p;
    }
  }
  if (platform === "linux") {
    for (const p of paths.linux) {
      if (fs.existsSync(p)) return p;
    }
  }
  return undefined; // Use Puppeteer's bundled Chromium
}

class SoraAutomation extends EventEmitter {
  constructor() {
    super();
    this.browser = null;
    this.soraUrl = "https://sora.chatgpt.com";
    this.maxRetries = 3;
    // cache the most recent video result so that renderer can poll after submission
    this.lastVideoResult = null;
  }

  emitProgress(status, detail = "") {
    this.emit("progress", { status, detail, timestamp: Date.now() });
  }

  async initBrowser() {
    // If browser exists but is disconnected, clear it
    if (this.browser && !this.browser.isConnected()) {
      console.log("Previous browser instance was disconnected. Cleaning up...");
      this.browser = null;
    }

    if (!this.browser) {
      const chromePath = getChromeExecutablePath();
      const launchOpts = {
        headless: false,
        userDataDir: path.join(os.tmpdir(), "tiktok-sora-chrome-user-data"),
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-blink-features=AutomationControlled",
          "--window-size=1440,900",
        ],
        ignoreDefaultArgs: ["--enable-automation"],
        defaultViewport: null,
      };
      if (chromePath) launchOpts.executablePath = chromePath;

      this.browser = await puppeteer.launch(launchOpts);

      // Listen for browser close/disconnect events
      this.browser.on("disconnected", () => {
        console.log("Browser was closed or disconnected.");
        this.browser = null;
      });
    }
    return this.browser;
  }

  async createVideoWithCharacter(imageData, prompt, options = {}) {
    const {
      characterId = "",
      resolution = "9:16",
      duration = "10s",
      videoCount = "1",
    } = options;
    let browser = null;
    try {
      browser = await this.initBrowser();
      const pages = await browser.pages();
      const page = pages.length > 0 ? pages[0] : await browser.newPage();

      // Set viewport
      await page.setViewport({ width: 1280, height: 720 });

      console.log("Navigating to Sora...");
      await page.goto(this.soraUrl, { waitUntil: "networkidle2" });

      // Wait for page to load
      await new Promise((r) => setTimeout(r, 3000));

      // Check if login is required
      let isLoggedIn = await this.checkLogin(page);
      if (!isLoggedIn) {
        console.log(
          "Please login manually. Waiting for authentication... (Timeout: 5 minutes)",
        );
        let waitCount = 0;
        const maxWait = 100; // 100 * 3s = 300s (5 minutes)

        while (!isLoggedIn && waitCount < maxWait) {
          await new Promise((r) => setTimeout(r, 3000));
          isLoggedIn = await this.checkLogin(page);
          waitCount++;

          if (waitCount % 10 === 0) {
            console.log(
              `Still waiting for login... (${Math.floor(waitCount * 3)}s elapsed)`,
            );
          }
        }

        if (!isLoggedIn) {
          throw new Error("Login timeout after 5 minutes.");
        } else {
          console.log("Login successful! Proceeding with automation...");
          await new Promise((r) => setTimeout(r, 2000)); // Wait a bit after login completes
        }
      }

      // Upload image if provided
      if (imageData && fs.existsSync(imageData)) {
        console.log("Uploading image...");
        await this.uploadImage(page, imageData);
        await new Promise((r) => setTimeout(r, 2000));
      }

      // Enter prompt
      console.log("Entering prompt...", prompt);
      await this.enterPrompt(page, prompt);
      await new Promise((r) => setTimeout(r, 1000));

      // Select character
      console.log(`Selecting character: ${characterId}`);
      // await this.selectCharacter(page, characterId);

      // Apply video settings: resolution, duration, videoCount
      this.emitProgress(
        "⚙️ Đang cấu hình video...",
        `${resolution} | ${duration} | ${videoCount} video`,
      );
      console.log(
        `Setting options -> Resolution: ${resolution}, Duration: ${duration}, Count: ${videoCount}`,
      );
      await this.applyVideoSettings(page, { resolution, duration, videoCount });

      console.log("Waiting a bit before submitting... ⏳");
      await new Promise((r) => setTimeout(r, 4000));

      // Submit video generation
      this.emitProgress("🚀 Đang gửi yêu cầu tạo video...");
      console.log("Submitting video generation...");
      await this.submitVideoGeneration(page);

      // Wait for Sora to process the submission
      console.log("Waiting for submission to be processed... ⏳");
      await new Promise((r) => setTimeout(r, 5000));

      // Screenshot after submit
      const tempDir = path.join(__dirname, "../../temp");
      await fs.ensureDir(tempDir);
      await page.screenshot({
        path: path.join(tempDir, "sora_after_submit.png"),
      });
      console.log("Current URL after submit:", page.url());

      // Navigate to drafts page to monitor video generation
      this.emitProgress("📋 Đang chuyển sang trang Drafts...");
      console.log("Navigating to drafts page...");
      try {
        await page.goto("https://sora.chatgpt.com/drafts", {
          waitUntil: "networkidle2",
          timeout: 30000,
        });
      } catch (navErr) {
        console.warn(
          "First navigation attempt failed, retrying...",
          navErr.message,
        );
        await new Promise((r) => setTimeout(r, 2000));
        await page.goto("https://sora.chatgpt.com/drafts", {
          waitUntil: "domcontentloaded",
          timeout: 30000,
        });
      }
      await new Promise((r) => setTimeout(r, 3000));
      console.log("Now on drafts page:", page.url());

      // Wait for video to be generated on drafts page
      this.emitProgress("⏳ Đang chờ video render...");
      console.log("Waiting for video generation to complete on drafts page...");
      const videoResult = await this.waitForVideoOnDrafts(page);

      if (videoResult.success) {
        console.log("Video generated successfully!");
        const res = {
          success: true,
          videoUrl: videoResult.videoUrl || null,
          characterId,
          timestamp: new Date().toISOString(),
        };
        // cache result for later polling
        this.lastVideoResult = res;
        return res;
      } else {
        const res = {
          success: false,
          error: videoResult.error || "Video generation failed",
          timestamp: new Date().toISOString(),
        };
        this.lastVideoResult = res;
        return res;
      }
    } catch (error) {
      console.error("Error in Sora automation:", error);

      // If overload error, close browser and return friendly error
      if (error.message && error.message.includes("OVERLOAD")) {
        console.log("Sora is overloaded. Closing browser...");
        if (browser) {
          try {
            await browser.close();
          } catch (e) {
            /* ignore */
          }
        }
        return {
          success: false,
          error: "Hệ thống tạo video đang quá tải. Vui lòng thử lại sau.",
          errorCode: "OVERLOAD",
          timestamp: new Date().toISOString(),
        };
      }

      throw error;
    }
  }

  async checkLogin(page) {
    try {
      // The most reliable way to check if logged in is to see if we can enter a prompt
      // or if we are on the main app page with its UI elements
      const isLoggedIn = await page.evaluate(() => {
        // Find text area or input field for prompt
        const textarea = document.querySelector("textarea");
        const editable = document.querySelector('[contenteditable="true"]');
        const textbox = document.querySelector('[role="textbox"]');

        // Also check if user profile picture or specific authenticated UI elements are present
        const avatar = document.querySelector(
          'img[alt*="profile"], [data-testid="profile-button"]',
        );

        // If any of these exist, we are likely logged in and ready
        if (textarea || editable || textbox || avatar) {
          return true;
        }

        // Check for common login indicators
        const loginBtn = document.querySelector(
          '[data-testid="login-button"], button[id*="login"], a[href*="login"]',
        );
        const welcomeText = Array.from(
          document.querySelectorAll("h1, h2"),
        ).some(
          (el) =>
            el.textContent.toLowerCase().includes("welcome") ||
            el.textContent.toLowerCase().includes("chào mừng"),
        );

        if (loginBtn || welcomeText) {
          return false;
        }

        // If we can't find anything, be safe and assume not logged in to give user a chance to check
        return false;
      });

      return isLoggedIn;
    } catch (e) {
      console.warn("Error checking login status:", e.message);
      return false; // Safest default is to wait if we get an error evaluating
    }
  }

  async uploadImage(page, imagePath) {
    try {
      const fileInput = await page.$('input[type="file"]');
      if (fileInput) {
        await fileInput.uploadFile(imagePath);
        await new Promise((r) => setTimeout(r, 2000));
      }
    } catch (error) {
      console.warn("Could not upload image:", error.message);
    }
  }

  async enterPrompt(page, prompt) {
    let promptEntered = false;
    // Xóa bỏ các ký tự xuống dòng để tránh việc Puppeteer tự động bấm Enter giữa chừng
    const safePrompt = prompt.replace(/[\r\n]+/g, " ").trim();

    try {
      // Find text area or input field for prompt
      const textarea = await page.$("textarea");
      if (textarea) {
        await textarea.click();
        await new Promise((r) => setTimeout(r, 500));
        await textarea.type(safePrompt, { delay: 15 });
        promptEntered = true;
      }

      if (!promptEntered) {
        const editable = await page.$('[contenteditable="true"]');
        if (editable) {
          await editable.click();
          await new Promise((r) => setTimeout(r, 500));
          await page.keyboard.type(safePrompt, { delay: 15 });
          promptEntered = true;
        }
      }

      if (!promptEntered) {
        const textbox = await page.$('[role="textbox"]');
        if (textbox) {
          await textbox.click();
          await new Promise((r) => setTimeout(r, 500));
          await page.keyboard.type(safePrompt, { delay: 15 });
          promptEntered = true;
        }
      }

      this.lastPromptEntered = promptEntered;
    } catch (error) {
      console.warn("Could not enter prompt:", error.message);
    }
  }

  async selectCharacter(page, characterId) {
    if (!characterId) return;
    try {
      console.log(`Selecting character: @${characterId}...`);

      // Thêm khoảng trắng trước @ nếu cần
      await page.keyboard.type(" ", { delay: 50 });
      await new Promise((r) => setTimeout(r, 300));

      // Gõ ký tự @ để trigger dropdown mention
      await page.keyboard.type("@", { delay: 50 });
      await new Promise((r) => setTimeout(r, 2000));

      // Gõ tên nhân vật để search/filter trong dropdown
      await page.keyboard.type(characterId, { delay: 30 });
      console.log("Typed character name, waiting for suggestions...");
      await new Promise((r) => setTimeout(r, 500));

      // Thử tìm và click vào suggestion item trong dropdown
      let characterSelected = false;

      try {
        characterSelected = await page.evaluate((charId) => {
          // Tìm các dropdown/listbox/menu items
          const selectors = [
            '[role="listbox"] [role="option"]',
            '[role="menu"] [role="menuitem"]',
            '[data-testid*="mention"]',
            '[data-testid*="suggestion"]',
            '[class*="mention"] li',
            '[class*="suggestion"] li',
            '[class*="dropdown"] li',
            '[class*="autocomplete"] li',
            'ul[role="listbox"] li',
            '[class*="popup"] li',
            '[class*="popover"] li',
          ];

          for (const selector of selectors) {
            const items = document.querySelectorAll(selector);
            for (const item of items) {
              const text = item.textContent.toLowerCase();
              if (text.includes("create")) continue; // Bỏ qua nút Create
              if (
                text.includes(charId.toLowerCase()) ||
                text.includes(charId.split(".").pop())
              ) {
                item.click();
                return true;
              }
            }
          }

          // Fallback: tìm bất kỳ element nào chứa text nhân vật và có thể click
          const allElements = document.querySelectorAll(
            "div, span, li, a, button, p",
          );
          for (const el of allElements) {
            const text = el.textContent.trim().toLowerCase();
            if (text.includes("create")) continue; // Bỏ qua nút Create

            const rect = el.getBoundingClientRect();
            // Chỉ xét element nhỏ (suggestion item), không phải container lớn
            if (
              (text.includes(charId.toLowerCase()) ||
                text.includes(charId.split(".").pop())) &&
              rect.height > 0 &&
              rect.height < 100 &&
              rect.width > 0 &&
              rect.width < 500
            ) {
              el.click();
              return true;
            }
          }

          return false;
        }, characterId);
      } catch (e) {
        console.warn(`Lỗi khi tìm suggestion: ${e.message}`);
      }

      // Always press Enter to confirm the selection
      console.log(
        `Character click result: ${characterSelected}, pressing Enter to confirm...`,
      );
      await page.keyboard.press("Enter");
      await new Promise((r) => setTimeout(r, 1500));
    } catch (error) {
      console.warn("Could not select character:", error.message);
    }
  }

  async applyVideoSettings(page, { resolution, duration, videoCount }) {
    try {
      console.log("Interacting with Sora UI for video settings...");
      const tempDir = path.join(__dirname, "../../temp");
      await fs.ensureDir(tempDir);

      // Helper: dump all visible menu items for diagnostics
      const dumpMenuItems = async (label) => {
        const items = await page.evaluate(() => {
          const els = document.querySelectorAll(
            'div[role="menuitem"], div[role="option"], div[role="radio"], div[role="menuitemradio"], [data-radix-collection-item], [data-state]',
          );
          return Array.from(els)
            .map((el) => {
              const rect = el.getBoundingClientRect();
              return {
                tag: el.tagName,
                role: el.getAttribute("role"),
                text: el.textContent.trim().substring(0, 80),
                dataState: el.getAttribute("data-state"),
                visible: rect.width > 0 && rect.height > 0,
                w: Math.round(rect.width),
                h: Math.round(rect.height),
              };
            })
            .filter((i) => i.visible && i.text.length > 0);
        });
        console.log(`--- ${label} (${items.length} items) ---`);
        items.forEach((item, i) =>
          console.log(
            `  [${i}] ${item.tag} role=${item.role} state=${item.dataState} "${item.text}"`,
          ),
        );
        console.log("---");
        return items;
      };

      // Helper: click a menu item by text, returns true if clicked
      const clickMenuItemByText = async (searchTexts, logLabel) => {
        console.log(`  Looking for: [${searchTexts.join(", ")}]`);
        const result = await page.evaluate((texts) => {
          // Search broadly in all interactive elements
          const allElements = document.querySelectorAll(
            'div[role="menuitem"], div[role="option"], div[role="radio"], div[role="menuitemradio"], button, [data-radix-collection-item]',
          );
          for (const el of allElements) {
            const elText = (el.textContent || "").trim().toLowerCase();
            if (!elText) continue;
            for (const t of texts) {
              const searchStr = t.toLowerCase();
              if (elText.includes(searchStr)) {
                const rect = el.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                  el.click();
                  return { clicked: true, matchedText: elText, searchedFor: t };
                }
              }
            }
          }
          return { clicked: false };
        }, searchTexts);

        if (result.clicked) {
          console.log(
            `  ✅ Clicked: "${result.matchedText}" (matched "${result.searchedFor}")`,
          );
        } else {
          console.log(`  ❌ Not found`);
        }
        await new Promise((r) => setTimeout(r, 1000));
        return result.clicked;
      };

      // Helper: click a RADIO sub-menu item by text (only targets menuitemradio elements)
      const clickRadioByText = async (searchTexts, logLabel) => {
        console.log(`  Looking for radio: [${searchTexts.join(", ")}]`);
        const result = await page.evaluate((texts) => {
          // ONLY target menuitemradio elements - these are the actual selectable sub-menu options
          const allElements = document.querySelectorAll(
            'div[role="menuitemradio"]',
          );
          for (const el of allElements) {
            const elText = (el.textContent || "").trim().toLowerCase();
            if (!elText) continue;
            for (const t of texts) {
              const searchStr = t.toLowerCase();
              if (elText === searchStr || elText.includes(searchStr)) {
                const rect = el.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                  el.click();
                  return { clicked: true, matchedText: elText, searchedFor: t };
                }
              }
            }
          }
          return { clicked: false };
        }, searchTexts);

        if (result.clicked) {
          console.log(
            `  ✅ Radio clicked: "${result.matchedText}" (matched "${result.searchedFor}")`,
          );
        } else {
          console.log(`  ❌ Radio not found`);
        }
        await new Promise((r) => setTimeout(r, 1000));
        return result.clicked;
      };

      // ===== Step 1: Open the Settings popup =====
      console.log("Step 1: Opening settings menu...");
      const settingsButtons = await page.$$('button[aria-label="Settings"]');

      if (settingsButtons.length > 0) {
        const targetBtn = settingsButtons[settingsButtons.length - 1];
        await targetBtn.click();
        console.log(
          `Clicked Settings button (found ${settingsButtons.length}, clicked last).`,
        );
        await new Promise((r) => setTimeout(r, 1500));
      } else {
        console.warn("Could not find Settings button!");
        return;
      }

      // Dump what's visible in the settings popup
      await dumpMenuItems("Settings popup items");
      await page.screenshot({
        path: path.join(tempDir, "sora_settings_menu_open.png"),
      });

      // ===== Step 2: Set Orientation =====
      const desiredOrientation =
        resolution === "16:9" ? "landscape" : "portrait";
      console.log(`Step 2: Setting orientation to ${desiredOrientation}...`);

      const clickedOrientationRow = await clickMenuItemByText(
        ["orientation", "hướng"],
        "Orientation row",
      );
      if (clickedOrientationRow) {
        await new Promise((r) => setTimeout(r, 1000));
        // Dump sub-menu items
        await dumpMenuItems("Orientation sub-menu");
        await page.screenshot({
          path: path.join(tempDir, "sora_orientation_submenu.png"),
        });

        // Select the desired orientation
        const orientationTexts =
          resolution === "16:9"
            ? ["landscape", "ngang", "16:9"]
            : ["portrait", "dọc", "9:16"];
        await clickRadioByText(orientationTexts, "Orientation value");

        await new Promise((r) => setTimeout(r, 800));
      } else {
        console.warn("Could not find Orientation menu item.");
      }

      // ===== Step 3: Set Duration =====
      const durationValue = duration.replace("s", "");
      console.log(`Step 3: Setting duration to ${duration}...`);

      const clickedDurationRow = await clickMenuItemByText(
        ["duration", "thời lượng"],
        "Duration row",
      );
      if (clickedDurationRow) {
        await new Promise((r) => setTimeout(r, 1000));
        await dumpMenuItems("Duration sub-menu");
        await page.screenshot({
          path: path.join(tempDir, "sora_duration_submenu.png"),
        });

        await clickRadioByText(
          [`${durationValue} seconds`, `${durationValue}s`, duration],
          "Duration value",
        );

        await new Promise((r) => setTimeout(r, 800));
      } else {
        console.warn("Could not find Duration menu item.");
      }

      // ===== Step 4: Set Video count =====
      console.log(`Step 4: Setting video count to ${videoCount}...`);

      const clickedVideosRow = await clickMenuItemByText(
        ["videos", "số lượng"],
        "Videos row",
      );
      if (clickedVideosRow) {
        await new Promise((r) => setTimeout(r, 1000));
        await dumpMenuItems("Videos sub-menu");
        await page.screenshot({
          path: path.join(tempDir, "sora_videos_submenu.png"),
        });

        await clickRadioByText([`${videoCount} video`], "Video count value");

        await new Promise((r) => setTimeout(r, 800));
      } else {
        console.warn("Could not find Videos menu item.");
      }

      // Final screenshot
      await page.screenshot({
        path: path.join(tempDir, "sora_after_video_settings.png"),
      });
      console.log("All video settings steps completed.");

      // Close settings menu by pressing Escape
      await page.keyboard.press("Escape");
      await new Promise((r) => setTimeout(r, 1000));
    } catch (error) {
      console.error("Error applying video settings:", error);
    }
  }

  async submitVideoGeneration(page) {
    try {
      console.log("Finalizing page state before submit... ⏳");
      await new Promise((r) => setTimeout(r, 500));

      const clickedCreate = await page.evaluate(() => {
        const createSpans = Array.from(
          document.querySelectorAll("span"),
        ).filter(
          (s) =>
            s.textContent &&
            (s.textContent.toLowerCase() === "create video" ||
              s.textContent.toLowerCase() === "tạo video"),
        );
        for (const span of createSpans) {
          const btn = span.closest("button");
          if (btn) {
            btn.click();
            return true;
          }
        }

        // Fallback to sending Enter if focus is on composer
        const composer = document.querySelector(
          'textarea, [contenteditable="true"], [role="textbox"]',
        );
        if (composer) {
          composer.focus();
          return false;
        }
        return false;
      });

      if (clickedCreate) {
        console.log('Clicked "Create video" button.');
      } else {
        console.log(
          "Could not find Create button, falling back to pressing Enter...",
        );
        await page.keyboard.press("Enter");
        await new Promise((r) => setTimeout(r, 500));
        await page.keyboard.press("Enter");
      }

      // Quick check for overload error (don't wait too long — page might navigate)
      await new Promise((r) => setTimeout(r, 2000));

      try {
        const overloadError = await page.evaluate(() => {
          const allText = document.body.innerText.toLowerCase();
          if (
            allText.includes("unable to generate") &&
            allText.includes("heavy load")
          ) {
            return true;
          }
          const alerts = document.querySelectorAll('[role="alert"]');
          for (const alert of alerts) {
            const text = (alert.textContent || "").toLowerCase();
            if (text.includes("unable") && text.includes("heavy load")) {
              return true;
            }
          }
          return false;
        });

        if (overloadError) {
          throw new Error(
            "OVERLOAD: Hệ thống tạo video đang quá tải. Vui lòng thử lại sau.",
          );
        }
      } catch (evalErr) {
        if (evalErr.message.includes("OVERLOAD")) throw evalErr;
        // page.evaluate failed — likely page is navigating, which is fine
        console.log(
          "Page may be navigating after submit (expected):",
          evalErr.message.substring(0, 80),
        );
      }

      console.log("Submit completed successfully.");
    } catch (error) {
      if (error.message.includes("OVERLOAD")) {
        throw error;
      }
      console.warn("Could not submit video generation:", error.message);
    }
  }

  async waitForVideoGeneration(page, timeout = 600000) {
    // Wait up to 10 minutes for video generation
    const startTime = Date.now();
    const maxWaitTime = timeout;

    while (Date.now() - startTime < maxWaitTime) {
      try {
        // Check for overload / error messages first
        const errorInfo = await page.evaluate(() => {
          const allText = document.body.innerText.toLowerCase();
          if (
            allText.includes("unable to generate") ||
            allText.includes("heavy load") ||
            allText.includes("try again later")
          ) {
            return { isOverload: true };
          }
          const alerts = document.querySelectorAll(
            '[role="alert"], [class*="toast"], [class*="error"]',
          );
          for (const alert of alerts) {
            const text = (alert.textContent || "").toLowerCase();
            if (
              text.includes("unable") ||
              text.includes("heavy load") ||
              text.includes("try again")
            ) {
              return { isOverload: true };
            }
          }
          return { isOverload: false };
        });

        if (errorInfo.isOverload) {
          throw new Error(
            "OVERLOAD: Hệ thống tạo video đang quá tải. Vui lòng thử lại sau.",
          );
        }

        // Look for video URL in the page
        const videoUrl = await page.evaluate(() => {
          const videoElement = document.querySelector("video source");
          if (videoElement) {
            return videoElement.src;
          }

          const downloadLink = document.querySelector(
            'a[download*="video"], a[href*="video"]',
          );
          if (downloadLink) {
            return downloadLink.href;
          }

          return null;
        });

        if (videoUrl) {
          return videoUrl;
        }

        // Check for other error messages
        const errorMessage = await page.$('.error-message, [role="alert"]');
        if (errorMessage) {
          const errorText = await page.evaluate(
            (el) => el.textContent,
            errorMessage,
          );
          throw new Error(`Video generation failed: ${errorText}`);
        }

        await new Promise((r) => setTimeout(r, 5000));
      } catch (error) {
        if (
          error.message.includes("OVERLOAD") ||
          error.message.includes("Video generation failed")
        ) {
          throw error;
        }
        // Continue waiting
        await new Promise((r) => setTimeout(r, 5000));
      }
    }

    throw new Error("Video generation timeout");
  }

  async waitForVideoOnDrafts(page, timeout = 600000) {
    const startTime = Date.now();
    const tempDir = path.join(__dirname, "../../temp");
    await fs.ensureDir(tempDir);

    console.log("Monitoring drafts page for video rendering...");

    let sawRendering = false;
    let initialHrefs = new Set();
    let isFirstCheck = true;

    // Phase 1: Wait until rendering completes
    while (Date.now() - startTime < timeout) {
      try {
        // Check for overload
        const hasOverload = await page.evaluate(() => {
          const text = document.body.innerText.toLowerCase();
          return (
            text.includes("unable to generate") && text.includes("heavy load")
          );
        });
        if (hasOverload) {
          throw new Error("OVERLOAD: Hệ thống tạo video đang quá tải.");
        }

        // Check each draft item by data-index attribute
        const draftStatus = await page.evaluate(() => {
          const draftItems = document.querySelectorAll("[data-index]");
          const drafts = [];

          for (const item of draftItems) {
            const index = item.getAttribute("data-index");
            const link =
              item.querySelector('a[href*="/d/gen_"]') ||
              item.querySelector('a[href*="/v/"]');
            const video = item.querySelector("video");
            const href = link ? link.getAttribute("href") : null;

            drafts.push({
              index: parseInt(index),
              hasLink: !!link,
              href,
              hasVideo: !!video,
              isRendering: !link,
            });
          }

          return {
            totalDrafts: drafts.length,
            drafts,
            renderingCount: drafts.filter((d) => d.isRendering).length,
            completedHrefs: drafts.filter((d) => d.href).map((d) => d.href),
          };
        });

        const elapsed = Math.round((Date.now() - startTime) / 1000);

        // On first check, save all existing completed hrefs
        if (isFirstCheck) {
          initialHrefs = new Set(draftStatus.completedHrefs);
          isFirstCheck = false;
          console.log(
            `Initial completed drafts: ${initialHrefs.size}, Rendering: ${draftStatus.renderingCount}`,
          );
        }

        // Track if we've ever seen rendering
        if (draftStatus.renderingCount > 0) {
          sawRendering = true;
        }

        console.log(
          `[${elapsed}s] Total: ${draftStatus.totalDrafts}, Rendering: ${draftStatus.renderingCount}, sawRendering: ${sawRendering}`,
        );
        if (elapsed < 15 || elapsed % 30 === 0) {
          console.log(
            "  Drafts:",
            JSON.stringify(draftStatus.drafts.slice(0, 5)),
          );
        }

        // Emit progress to UI
        if (draftStatus.renderingCount > 0) {
          const mins = Math.floor(elapsed / 60);
          const secs = elapsed % 60;
          this.emitProgress(
            `⏳ Đang render video... (${mins}:${secs.toString().padStart(2, "0")})`,
            `${draftStatus.renderingCount} video đang xử lý`,
          );
        } else if (!sawRendering) {
          this.emitProgress(
            "⏳ Đang chờ video xuất hiện...",
            `Đã chờ ${elapsed}s`,
          );
        }

        // Done: we saw rendering at some point AND now nothing is rendering
        if (sawRendering && draftStatus.renderingCount === 0) {
          // New hrefs = hrefs that weren't in the initial set
          const newHrefs = draftStatus.completedHrefs.filter(
            (h) => !initialHrefs.has(h),
          );
          console.log(
            `Rendering complete! ${newHrefs.length} new videos.`,
            newHrefs,
          );

          // If no new hrefs found, just take the latest ones
          const hrefsToPost =
            newHrefs.length > 0
              ? newHrefs
              : draftStatus.completedHrefs.slice(0, 1);
          this.emitProgress(
            `✅ ${hrefsToPost.length} video đã render xong!`,
            "Đang chuẩn bị post...",
          );
          await page.screenshot({
            path: path.join(tempDir, "sora_drafts_completed.png"),
          });

          // Phase 1.5: Open each draft in a NEW TAB and click Post
          const browser = page.browser();
          for (let i = 0; i < hrefsToPost.length; i++) {
            try {
              const draftUrl = `https://sora.chatgpt.com${hrefsToPost[i]}`;
              console.log(
                `Opening draft ${i + 1}/${hrefsToPost.length} in new tab: ${draftUrl}`,
              );
              this.emitProgress(
                `📤 Đang post video ${i + 1}/${hrefsToPost.length}...`,
              );

              const newTab = await browser.newPage();
              await newTab.goto(draftUrl, {
                waitUntil: "networkidle2",
                timeout: 30000,
              });
              await new Promise((r) => setTimeout(r, 3000));
              await newTab.screenshot({
                path: path.join(tempDir, `sora_draft_detail_${i + 1}.png`),
              });

              // Find and click the Post button
              const posted = await newTab.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll("button"));
                for (const btn of buttons) {
                  const text = (btn.textContent || "").trim().toLowerCase();
                  if (
                    text === "post" ||
                    text === "đăng" ||
                    text === "publish" ||
                    text === "share"
                  ) {
                    btn.click();
                    return text;
                  }
                }
                const spans = Array.from(
                  document.querySelectorAll("button span"),
                );
                for (const span of spans) {
                  const text = (span.textContent || "").trim().toLowerCase();
                  if (
                    text === "post" ||
                    text === "đăng" ||
                    text === "publish" ||
                    text === "share"
                  ) {
                    span.closest("button").click();
                    return text;
                  }
                }
                return null;
              });

              if (posted) {
                console.log(`Clicked "${posted}" button for video ${i + 1}!`);
                await new Promise((r) => setTimeout(r, 3000));
                await newTab.screenshot({
                  path: path.join(tempDir, `sora_posted_${i + 1}.png`),
                });
                this.emitProgress(`✅ Video ${i + 1} đã post!`);
              } else {
                console.warn(`Could not find Post button for video ${i + 1}`);
                const allButtons = await newTab.evaluate(() =>
                  Array.from(document.querySelectorAll("button"))
                    .map((b) => b.textContent.trim())
                    .filter(Boolean)
                    .slice(0, 10),
                );
                console.log("Available buttons:", allButtons);
              }

              await newTab.close();
            } catch (postErr) {
              console.warn(`Error posting video ${i + 1}:`, postErr.message);
            }
          }
          break;
        }

        if (draftStatus.renderingCount > 0) {
          console.log(
            `${draftStatus.renderingCount} videos still rendering...`,
          );
        } else if (draftStatus.totalDrafts === 0) {
          console.log("No new drafts yet, waiting...");
        }

        // Reload periodically
        if (elapsed > 0 && elapsed % 30 === 0) {
          console.log("Refreshing drafts page...");
          await page.reload({ waitUntil: "networkidle2", timeout: 15000 });
          await new Promise((r) => setTimeout(r, 2000));
        }

        await new Promise((r) => setTimeout(r, 5000));
      } catch (error) {
        if (error.message.includes("OVERLOAD")) throw error;
        console.warn("Error checking drafts:", error.message);
        await new Promise((r) => setTimeout(r, 5000));
      }
    }

    // Check timeout
    if (Date.now() - startTime >= timeout) {
      return {
        success: false,
        error: "Video generation timeout after 10 minutes.",
      };
    }

    // Phase 2: Navigate to profile page to get video links
    console.log("Navigating to profile page to extract video links...");
    try {
      await page.goto("https://sora.chatgpt.com/profile", {
        waitUntil: "networkidle2",
        timeout: 30000,
      });
      await new Promise((r) => setTimeout(r, 3000));
      await page.screenshot({
        path: path.join(tempDir, "sora_profile_page.png"),
      });

      const videoUrls = await page.evaluate(() => {
        const allLinks = Array.from(document.querySelectorAll("a"));
        const videoLinks = allLinks
          .map((a) => {
            const href = a.getAttribute("href") || "";
            if (
              href.startsWith("/d/gen_") ||
              href.includes("/v/") ||
              href.includes("/video/")
            ) {
              return href.startsWith("/")
                ? window.location.origin + href
                : href;
            }
            return null;
          })
          .filter(Boolean);
        return [...new Set(videoLinks)];
      });

      console.log(
        `Found ${videoUrls.length} video links on profile:`,
        videoUrls,
      );

      return {
        success: true,
        videoUrl: videoUrls.length > 0 ? videoUrls : [page.url()],
      };
    } catch (error) {
      console.error("Error navigating to profile:", error.message);
      return { success: true, videoUrl: [] };
    }
  }

  async pollForVideoResult() {
    // simply return the cached result from the last submission
    if (this.lastVideoResult) {
      return this.lastVideoResult;
    }
    return { success: false, error: "No video result available" };
  }

  /**
   * Tải video từ trang Sora (link trang, không phải .mp4 trực tiếp).
   * Xử lý cả blob: URL và https: URL.
   */
  async downloadVideoFromPage(pageUrl, outputFilePath) {
    if (!pageUrl || typeof pageUrl !== "string") {
      return { success: false, error: "Invalid page URL" };
    }
    const url = Array.isArray(pageUrl) ? pageUrl[0] : pageUrl;
    if (!url || !url.startsWith("http")) {
      return { success: false, error: "URL must be an HTTP(S) page link" };
    }

    try {
      const browser = await this.initBrowser();
      const pages = await browser.pages();
      const page = pages.length > 0 ? pages[0] : await browser.newPage();

      await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
      await new Promise((r) => setTimeout(r, 3000));

      const videoInfo = await page.evaluate(async () => {
        const video =
          document.querySelector("video source") ||
          document.querySelector("video");
        if (!video) return { error: "No video element found" };
        const src = video.src || video.querySelector("source")?.src;
        if (!src) return { error: "No video src found" };

        if (src.startsWith("blob:")) {
          try {
            const res = await fetch(src);
            const blob = await res.blob();
            const buf = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsArrayBuffer(blob);
            });
            const bytes = new Uint8Array(buf);
            let binary = "";
            const chunk = 8192;
            for (let i = 0; i < bytes.length; i += chunk) {
              const slice = bytes.subarray(
                i,
                Math.min(i + chunk, bytes.length),
              );
              binary += String.fromCharCode.apply(null, slice);
            }
            return { type: "blob", base64: btoa(binary) };
          } catch (e) {
            return { error: "Failed to fetch blob: " + e.message };
          }
        }
        return { type: "url", url: src };
      });

      if (videoInfo.error) {
        return { success: false, error: videoInfo.error };
      }

      let buffer;
      if (videoInfo.type === "blob" && videoInfo.base64) {
        buffer = Buffer.from(videoInfo.base64, "base64");
      } else if (videoInfo.type === "url" && videoInfo.url) {
        const fetch = require("node-fetch");
        const res = await fetch(videoInfo.url);
        if (!res.ok) throw new Error("HTTP " + res.status);
        buffer = await res.buffer();
      } else {
        return { success: false, error: "Could not get video data" };
      }

      await fs.ensureDir(path.dirname(outputFilePath));
      await fs.writeFile(outputFilePath, buffer);
      return { success: true, filePath: outputFilePath };
    } catch (error) {
      console.error("downloadVideoFromPage error:", error);
      return { success: false, error: error.message };
    }
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

module.exports = new SoraAutomation();
