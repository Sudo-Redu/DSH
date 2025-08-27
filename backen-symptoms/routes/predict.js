const express = require("express");
const router = express.Router();
const dataset = require("../dataset.json");


router.post("/predict", async (req, res) => {
  const { Symptoms } = req.body;
  if (!Symptoms || !Array.isArray(Symptoms) || Symptoms.length === 0) {
    return res.status(400).json({ error: "Symptoms array required" });
  }

  const diseaseSymptomMap = {};

  dataset.forEach(disease => {
    // The symptoms from the disease
    const matchedSymptoms = [];
    const allSymptoms = disease.Symptoms.map(sym => sym.Symptom);

    Symptoms.forEach(inputSymptom => {
      const ds = disease.Symptoms.find(
        dSym =>
          dSym.Symptom.toLowerCase().trim() === inputSymptom.Symptom.toLowerCase().trim() &&
          inputSymptom.Severity <= dSym.Severity &&
          inputSymptom.Duration <= dSym.Duration
      );
      if (ds) {
        matchedSymptoms.push(ds.Symptom);
      }
    });

    // Only show if at least one symptom matches
    if (matchedSymptoms.length > 0) {
      // Calculate unmatched
      const unmatchedSymptoms = allSymptoms.filter(sym =>
        !matchedSymptoms.includes(sym)
      );

      // Calculate confidence
      let confidence = (matchedSymptoms.length / Symptoms.length) * 100;
      if (confidence > 99) confidence = 99.1;
      if (Symptoms.length === 1) confidence = 20;

      diseaseSymptomMap[disease.Disease] = {
        Disease: disease.Disease,
        MatchedSymptoms: matchedSymptoms, // Array of matched
        AllSymptoms: allSymptoms,         // Array of all
        UnmatchedSymptoms: unmatchedSymptoms, // Array of unmatched
        Medicines: disease.Medicines,
        "Brand Names": disease["Brand Names"],
        Dosages: disease.Dosages,
        "Prices (INR)": disease["Prices (INR)"],
        confidence: confidence.toFixed(1),
        _matchCount: matchedSymptoms.length
      };
    }
  });

  const sorted = Object.values(diseaseSymptomMap).sort(
    (a, b) => b._matchCount - a._matchCount
  );

  sorted.forEach(d => delete d._matchCount);

  res.json(sorted);
});

module.exports = router;