# Keep Awake

Keep Awake is a simple web application that prevents your device's screen from turning off. It uses the Screen Wake Lock API to keep your screen active and the Document Picture-in-Picture API to provide a floating control window that remains visible when you switch to other tabs or applications.

## For End-Users

### Purpose

This application is designed for anyone who needs to keep their screen on for extended periods without interacting with it. This can be useful for:

*   Reading long articles or recipes.
*   Following along with a video tutorial.
*   Monitoring a dashboard or a long-running process.
*   Giving a presentation.

### How to Use

1.  **Toggle Wake Lock**: Click the "Keep Screen Awake" toggle switch to activate or deactivate the screen wake lock. When active, your screen will not turn off.
2.  **Picture-in-Picture (PIP) Mode**: Click the "Toggle Picture-in-Picture" button to open a small, floating window with the wake lock controls. This allows you to keep the controls accessible while using other applications or browser tabs.
3.  **Automatic PIP**: The application will automatically enter PIP mode when you switch to another tab, ensuring the wake lock remains active.

## For Developers

### Technical Details

This project was built using modern web technologies to provide a simple yet effective user experience.

#### Technology Stack

*   **Vite**: A fast build tool that provides a modern development environment with features like Hot Module Replacement (HMR).
*   **TypeScript**: A typed superset of JavaScript that enhances code quality and maintainability.
*   **TailwindCSS**: A utility-first CSS framework for rapidly building custom user interfaces.

#### Screen Wake Lock API

The core functionality of this application relies on the [Screen Wake Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API). This API allows a web page to request a wake lock, which prevents the device's screen from turning off.

*   **`KeepAwake.ts`**: This file contains the `KeepAwake` class, which encapsulates the logic for requesting, releasing, and managing the wake lock.
*   **`navigator.wakeLock.request()`**: This method is called to request a wake lock. It returns a `WakeLockSentinel` object, which can be used to release the lock.
*   **Visibility Changes**: The application listens for `visibilitychange` events. When the main window becomes hidden, the wake lock is automatically managed to ensure it remains active in PIP mode.

#### Document Picture-in-Picture API

To provide a seamless user experience, the application uses the [Document Picture-in-Picture API](https://developer.mozilla.org/en-US/docs/Web/API/Document_Picture-in-Picture_API). This allows the main controls of the application to be moved into a small, floating window.

*   **`PIP.ts`**: This file contains the `PIPElement` class, which handles the creation and management of the Picture-in-Picture window.
*   **`window.documentPictureInPicture.requestWindow()`**: This method is used to open a new PIP window and move the controls container into it.
*   **Styling**: Styles from the main document are dynamically copied into the PIP window to ensure a consistent appearance.

#### Application Flow

1.  **Initialization**: When the application loads, `main.ts` initializes the `KeepAwakeApp` class.
2.  **UI Setup**: The `KeepAwakeApp` class sets up all the UI elements and event listeners for the toggle switches and buttons.
3.  **Wake Lock Toggle**: When the user toggles the wake lock, the `handleWakeLockToggle` method calls the `KeepAwake` class to request or release the wake lock.
4.  **PIP Toggle**: When the user clicks the "Toggle Picture-in-Picture" button, the `handlePipToggle` method uses the `PIPElement` class to open or close the PIP window.
5.  **Automatic PIP**: A `visibilitychange` event listener on the main document triggers the `handleVisibilityChange` method, which automatically opens the PIP window when the user navigates to a different tab.
6.  **State Management**: The application manages the state of the wake lock and PIP mode, updating the UI accordingly. When in PIP mode, a separate `KeepAwakePIP` instance is created to manage the wake lock within the PIP window.