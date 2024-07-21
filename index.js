import express from "express";
import connectDB from "./database-connection/db.connect.js";
import userRoutes from "./user/user.controller.js";
const app = express();

//app to understand json
app.use(express.json());

//connect Db
await connectDB();
//register routes
app.use(userRoutes);

//network port and server
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`App is listening on ${PORT}`);
});
