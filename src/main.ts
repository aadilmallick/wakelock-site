import { KeepAwake, KeepAwakePIP } from "./KeepAwake";
import { PIPElement } from "./PIP";

class KeepAwakeApp {
  private keepAwake: KeepAwake;
  private pipElement: PIPElement | null = null;
  private keepAwakePIP: KeepAwakePIP | null = null;
  private isWakeLockActive = false;
  private isPipMode = false;
  private controlsContainer!: HTMLElement;
  private infoSection!: HTMLElement;

  // UI Elements
  private wakelockToggle!: HTMLInputElement;
  private toggleBg!: HTMLElement;
  private toggleDot!: HTMLElement;
  private statusDot!: HTMLElement;
  private statusText!: HTMLElement;
  private pipToggleBtn!: HTMLButtonElement;
  private pipStatusText!: HTMLElement;

  constructor() {
    this.keepAwake = new KeepAwake();
    this.initializeElements();
    this.setupEventListeners();
    this.initializePIP();
    this.updateUI();

    // Start the keepAwake functionality (handles visibility changes)
    // this.keepAwake.keepAwake();
  }

  private initializeElements() {
    this.controlsContainer = document.getElementById("controls-container")!;
    this.infoSection = document.getElementById("info-section")!;
    this.wakelockToggle = document.getElementById(
      "wakelock-toggle"
    ) as HTMLInputElement;
    this.toggleBg = document.getElementById("toggle-bg")!;
    this.toggleDot = document.getElementById("toggle-dot")!;
    this.statusDot = document.getElementById("status-dot")!;
    this.statusText = document.getElementById("status-text")!;
    this.pipToggleBtn = document.getElementById(
      "pip-toggle"
    ) as HTMLButtonElement;
    this.pipStatusText = document.getElementById("pip-status-text")!;
  }

  private initializePIP() {
    // Only initialize PIP if the API is available
    if (PIPElement.isAPIAvailable) {
      this.pipElement = new PIPElement(this.controlsContainer);
      console.log("PIP element initialized", this.pipElement);
    } else {
      // Hide PIP button if not supported
      this.pipToggleBtn.style.display = "none";
      this.pipStatusText.textContent = "PIP not supported in this browser";
    }
  }

  private setupEventListeners() {
    // Wake lock toggle
    this.wakelockToggle.addEventListener(
      "change",
      this.handleWakeLockToggle.bind(this)
    );
    this.toggleBg.addEventListener("click", () => {
      this.wakelockToggle.click();
    });

    // PIP toggle
    this.pipToggleBtn.addEventListener("click", () => {
      console.log("PIP toggle clicked");
      this.handlePipToggle();
    });

    // Listen for visibility changes to auto-activate PIP
    document.addEventListener("visibilitychange", () => {
      this.handleVisibilityChange();
    });

    this.keepAwake.keepAwake({
      onHidden: () => {
        console.log("Main window hidden");
        // Only auto-activate PIP if not already in PIP mode
        if (!this.isPipMode && PIPElement.isAPIAvailable && this.pipElement) {
          console.log("Auto-activating PIP mode...");
          this.handlePipToggle();
        }
      },
      onVisible: () => {
        console.log("Main window visible");
        // Main window visibility handling is managed by KeepAwake class
      },
    });
    // Monitor wake lock status changes
    // this.monitorWakeLockStatus();
  }

  private async handleWakeLockToggle() {
    try {
      if (this.wakelockToggle.checked) {
        await this.keepAwake.request();
        this.isWakeLockActive = true;
        if (this.isPipMode) {
          await this.keepAwakePIP?.request();
        }
      } else {
        this.keepAwake.release();
        this.isWakeLockActive = false;
        if (this.isPipMode) {
          this.keepAwakePIP?.release();
        }
      }
      this.updateUI();
    } catch (error) {
      console.error("Error toggling wake lock:", error);
      this.wakelockToggle.checked = false;
      this.isWakeLockActive = false;
      this.updateUI();
    }
  }

  private async handlePipToggle() {
    if (!this.pipElement) {
      console.error("PIP element not found");
      return;
    }

    try {
      await this.pipElement.togglePictureInPicture({
        onOpen: (pipWindow: Window) => {
          console.log("PIP window opened", pipWindow);
          this.isPipMode = true;

          // Stop main window wake lock since PIP will handle it
          this.keepAwake.release();

          // Create and start PIP wake lock
          this.keepAwakePIP = new KeepAwakePIP(pipWindow);
          this.keepAwakePIP.keepAwake({
            onHidden: () => {
              console.log("PIP window hidden, wake lock released");
              this.isWakeLockActive = false;
              this.updateUI();
            },
            onVisible: () => {
              console.log("PIP window visible, wake lock active");
              this.isWakeLockActive = true;
              this.updateUI();
            },
          });

          // Set initial state based on current wake lock
          this.isWakeLockActive = true;
          this.infoSection.style.display = "none";
          this.updateUI();
        },
        onClose: () => {
          console.log("PIP window closed");
          this.isPipMode = false;

          // Clean up PIP wake lock
          if (this.keepAwakePIP) {
            this.keepAwakePIP.destroy();
            this.keepAwakePIP = null;
          }

          // Resume main window wake lock if toggle is still on
          if (this.wakelockToggle.checked) {
            this.keepAwake.request();
            this.isWakeLockActive = true;
          }

          this.infoSection.style.display = "block";
          this.updateUI();

          // Re-append controls to main document
          document
            .querySelector("#app .max-w-md")!
            .insertBefore(this.controlsContainer, this.infoSection);
        },
      });
    } catch (error) {
      console.error("Error toggling PIP:", error);
    }
  }

  private handleVisibilityChange() {
    // Auto-activate PIP when document becomes hidden (user switches tabs)
    if (
      document.visibilityState === "hidden" &&
      this.pipElement &&
      !this.isPipMode &&
      PIPElement.isAPIAvailable
    ) {
      console.log("Document hidden, activating PIP mode...");
      this.handlePipToggle();
    }
  }

  // private monitorWakeLockStatus() {
  //   // Periodically check if wake lock is still active
  //   setInterval(() => {
  //     const wasActive = this.isWakeLockActive;

  //     // Check appropriate wake lock based on current mode
  //     if (this.isPipMode && this.keepAwakePIP) {
  //       this.isWakeLockActive =
  //         !!this.keepAwakePIP.wakeLock && !this.keepAwakePIP.wakeLock.released;
  //     } else {
  //       this.isWakeLockActive =
  //         !!this.keepAwake.wakeLock && !this.keepAwake.wakeLock.released;
  //     }

  //     // Update UI if status changed
  //     if (wasActive !== this.isWakeLockActive) {
  //       this.wakelockToggle.checked = this.isWakeLockActive;
  //       this.updateUI();
  //     }
  //   }, 1000);
  // }

  private updateUI() {
    // Update wake lock toggle appearance
    if (this.isWakeLockActive) {
      this.toggleBg.classList.remove("bg-gray-600");
      this.toggleBg.classList.add("bg-blue-600");
      this.toggleDot.classList.add("translate-x-6");
      this.statusDot.classList.remove("bg-red-500");
      this.statusDot.classList.add("bg-green-500");
      this.statusText.textContent = "Active";
    } else {
      this.toggleBg.classList.remove("bg-blue-600");
      this.toggleBg.classList.add("bg-gray-600");
      this.toggleDot.classList.remove("translate-x-6");
      this.statusDot.classList.remove("bg-green-500");
      this.statusDot.classList.add("bg-red-500");
      this.statusText.textContent = "Inactive";
    }

    // Update PIP status
    if (this.isPipMode) {
      this.pipStatusText.textContent = "PIP: Active";
      this.pipToggleBtn.textContent = "Exit Picture-in-Picture";
      // const controlsContainer = document.querySelector(
      //   "#controls-container"
      // ) as HTMLElement;
      // controlsContainer.style.display = "none";
    } else {
      this.pipStatusText.textContent = "PIP: Inactive";
      this.pipToggleBtn.textContent = "Toggle Picture-in-Picture";
      // const controlsContainer = document.querySelector(
      //   "#controls-container"
      // ) as HTMLElement;
      // controlsContainer.style.display = "block";
    }
  }

  // Cleanup method
  public destroy() {
    this.keepAwake.destroy();
    if (this.pipElement && this.isPipMode) {
      PIPElement.closePipWindow();
    }
  }
}

// Initialize the app when DOM is loaded
// document.addEventListener("DOMContentLoaded", () => {
//   const app = new KeepAwakeApp();

//   // Cleanup on page unload
//   window.addEventListener("beforeunload", () => {
//     app.destroy();
//   });
// });

// // Also initialize immediately if DOM is already loaded
// if (document.readyState === "loading") {
//   // DOM not yet loaded, wait for DOMContentLoaded
// } else {
//   // DOM already loaded
//   const app = new KeepAwakeApp();

//   window.addEventListener("beforeunload", () => {
//     app.destroy();
//   });
// }
const app = new KeepAwakeApp();

window.addEventListener("beforeunload", () => {
  app.destroy();
});
