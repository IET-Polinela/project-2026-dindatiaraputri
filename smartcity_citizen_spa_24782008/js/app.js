import { router } from "./router.js?v=20260616-2";

// Initialize router and listen for hash changes
router();
window.addEventListener("hashchange", router);
