import { router } from "./router.js";

// Initialize router and listen for hash changes
router();
window.addEventListener("hashchange", router);
