import dotenv from "dotenv";
dotenv.config();
import express from "express";
import path from "path";
import cors from "cors";
import bodyParser from "body-parser";
import fileupload from "express-fileupload";
import compression from "compression";
import handleConnectToMongodb from "./config.js";
import routeIndex from "./routes/routesIndex.js";

const PORT = process.env.PORT || 8000;
// console.log(PORT, "PORT")

const app = express();
handleConnectToMongodb();

// Apply compression middleware
app.use(compression());

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileupload());
app.use(cors({ origin: "*" }));

app.use(express.static(path.join(process.cwd(), "assets"))); // Changed __dirname to process.cwd()

app.use("/", routeIndex);

app.listen(PORT, () => {
  // console.log(`your server is started http://localhost:${PORT}`);
});
