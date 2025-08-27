import os
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from rapidfuzz import process, fuzz
import google.generativeai as genai
import json
import re



# --------------------
# CONFIG
# --------------------
# for local use only
# API_KEY = "api key here"  # Replace with your actual Gemini API key
# genai.configure(api_key=API_KEY)
# model = genai.GenerativeModel("gemini-1.5-flash")  # or gemini-1.5-pro

#######################################################################
# Load API key from environment
API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is not set!")

genai.configure(api_key=API_KEY)

# Choose your model
model = genai.GenerativeModel("gemini-1.5-flash")  # or "gemini-1.5-pro"

########################################################################
# --------------------
# Load medicine dataset
# --------------------
# df = pd.read_csv("A_Z_medicines_dataset_of_India.csv")
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
df = pd.read_csv(os.path.join(BASE_DIR, "A_Z_medicines_dataset_of_India.csv"))
if "name" not in df.columns:
    raise ValueError("CSV must have 'name' column")
medicine_list = df["name"].astype(str).tolist()

# --------------------
# FastAPI setup
# --------------------
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------
# Helper functions
# --------------------
def extract_medicines_from_image(file: UploadFile):
    """
    Uses Gemini API to extract medicines + dosage from prescription image.
    Returns list of dicts: [{"name": "...", "dosage": "..."}]
    """
    try:
        response = model.generate_content(
            [
                {
                    "role": "user",
                    "parts": [
                        {
                            "text": """Extract ONLY medicine names and their dosage from this prescription.
Output strictly as JSON array of objects like:
[{"name": "Augmentin 625 Duo Tablet", "dosage": "1 tab twice daily"}]
If dosage not available, set dosage as "" (empty string). No extra text, no markdown."""
                        },
                        {"inline_data": {"mime_type": file.content_type, "data": file.file.read()}}
                    ]
                }
            ]
        )

        raw_text = getattr(response, "text", "").strip()
        print("🔹 Gemini raw output:", raw_text)  # Debug log

        # Try to parse JSON
        try:
            cleaned = re.sub(r"```json|```", "", raw_text).strip()
            medicines = json.loads(cleaned)
            if isinstance(medicines, list):
                return medicines
            else:
                print("⚠️ Gemini output is not a list:", medicines)
                return [{"name": raw_text, "dosage": "", "status": "❌ Not Verified"}]
        except Exception as e:
            print("⚠️ JSON parse error:", e)
            # Fallback: return raw text as a single medicine
            return [{"name": raw_text, "dosage": "", "status": "❌ Not Verified"}]

    except Exception as e:
        print("⚠️ Error calling Gemini:", e)
        return [{"name": "Error contacting Gemini", "dosage": "", "status": "❌ Not Verified"}]

def verify_medicines(extracted, dataset, threshold=80):
    """
    Returns all medicines with verification status
    """
    final_output = []
    for med in extracted:
        med_name = med.get("name", "").strip()
        dosage = med.get("dosage", "").strip()

        match = process.extractOne(med_name, dataset, scorer=fuzz.WRatio)
        status = "✅ Verified" if match and match[1] >= threshold else "❌ Not Verified"

        final_output.append({
            "name": med_name,
            "dosage": dosage if dosage else "",
            "status": status
        })
    return final_output

# --------------------
# API Route
# --------------------
@app.post("/api/extract_medicines")
async def extract_prescription(file: UploadFile = File(...)):
    extracted = extract_medicines_from_image(file)
    verified = verify_medicines(extracted, medicine_list)
    return {"medicines": verified}
