const express = require("express");
const cors = require("cors");
const predictionRoutes = require("./routes/predict");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use("/api/predict", predictionRoutes); // This means POST /api/predict/predict

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});