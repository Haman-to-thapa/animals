import app from "./app";
import { ENV } from "./config/env";

app.listen(ENV.PORT, () => {

  // Server ready for AI requests (Port 4001, Model updated to llama-3.1-8b-instant)
});
