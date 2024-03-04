class SnackbarManager {
    constructor() {
      this.snackbar = null;
    }
  
    setSnackbar(snackbar) {
      this.snackbar = snackbar;
    }
  
    showMessage(message) {
      this.snackbar && this.snackbar(message);
    }
  }
  
  const snackbarManager = new SnackbarManager();
  
  export default snackbarManager;
  