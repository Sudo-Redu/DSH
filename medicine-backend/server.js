const express = require("express");
const cors = require("cors");
require("dotenv").config();
const analyzeRoute = require("./routes/analyze"); // Ensure path is correct

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Use /analyze for the route
app.use("/analyze", analyzeRoute);

app.get("/", (req, res) => {
  res.send("Server is working!");
});
console.log("Gemini API KEY:", process.env.GEMINI_API_KEY ? "Loaded" : "NOT SET");


app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
