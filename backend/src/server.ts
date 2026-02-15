console.log("--> SERVER SCRIPT STARTED <--");
// Import app AFTER logging to catch import errors
import app from "./app";
import { ENV } from "./config/env";
import { initCronJobs } from "./services/cronService";
console.log("--> IMPORTS COMPLETED <--");

app.listen(ENV.PORT, () => {
  console.log(`Server running on port ${ENV.PORT}`);
  initCronJobs();
  // Server ready for AI requests (Port 4001, Model updated to llama-3.1-8b-instant)
});
