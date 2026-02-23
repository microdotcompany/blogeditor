import { app } from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./config/database.js";
const start = async () => {
    await connectDatabase();
    app.listen(env.PORT, () => {
        console.log(`Server running on http://localhost:${env.PORT}`);
    });
};
start().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map