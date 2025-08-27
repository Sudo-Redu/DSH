"use client";

import { motion, AnimatePresence } from "framer-motion";
import React, { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function GenericMedicineFinder() {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  // Now store the entire result array
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"upload" | "preview" | "results">("upload");

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      setStep("preview");
    }
  };

  const findGenericMedicine = async () => {
    if (!uploadedImage) return;

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", uploadedImage);

      //"http://localhost:5000/analyze"
      const response = await fetch("/api/medicine/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      // Handle both array and object for backward compatibility
      let resultArray: any[] = [];
      if (Array.isArray(data)) {
        resultArray = data;
      } else if (typeof data === "object" && data !== null) {
        resultArray = [data];
      }

      setResults(resultArray);
      setStep("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setUploadedImage(null);
    setImagePreviewUrl(null);
    setResults([]);
    setError(null);
    setStep("upload");
  };

  return (
    <>
      <Navbar />
      <br />
      <br />
      <br />
      <br />
      <main className="min-h-screen bg-gradient-to-br from-black via-[#006994] to-[#004f63] text-white shadow-[0_0_40px_#006994] ring-1 ring-[#006994]/50 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <header className="mb-8 text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-black via-[#006994] to-[#004f63] p-2 rounded-lg mr-3 shadow-[0_0_20px_#006994] ring-1 ring-[#006994]/50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="6" y="4" width="12" height="16" rx="6" ry="6" />
                  <rect x="10" y="10" width="4" height="4" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-100 to-blue-500 bg-clip-text text-transparent font-poppins">
                  PharmaSahayak AI
                </h1>
                <p className="bg-gradient-to-r from-white to-cyan-500 bg-clip-text text-transparent">
                  Find affordable alternatives to expensive medications using AI
                </p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4 mx-auto max-w-md">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full"
                initial={{ width: "20%" }}
                animate={{
                  width:
                    step === "upload"
                      ? "20%"
                      : step === "preview"
                      ? "50%"
                      : "100%",
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </header>
          <div className="w-full mb-8">
            <img
              src="/images/banner.jpg"
              alt="Doctor Saath Hai main banner"
              className="w-full h-[500px] object-cover rounded-xl shadow-[0_0_40px_#006994] ring-2 ring-[#006994]/30"
            />
          </div>
          {/* Card Content */}
          <AnimatePresence mode="wait">
            {step == "upload" && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-lg p-6 text-black max-w-md mx-auto"
              >
                <h2 className="text-2xl font-semibold mb-4 text-[#004f63] text-center font-poppins">
                  Upload Medicine Photo
                </h2>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="medicine-photo"
                />
                <button
                  onClick={() =>
                    document.getElementById("medicine-photo")?.click()
                  }
                  className="w-full px-6 py-3 rounded-xl font-medium border-2 border-cyan-600 bg-gradient-to-r from-[#004f63] to-blue-300 text-white hover:from-cyan-600 hover:to-cyan-700 transition-all"
                >
                  Choose File
                </button>
              </motion.div>
            )}

            {step === "preview" && imagePreviewUrl && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-lg p-6 text-black max-w-md mx-auto"
              >
                <h2 className="text-2xl font-semibold mb-4 text-[#004f63] text-center">
                  Image Preview
                </h2>
                <div className="flex justify-center mb-4">
                  <img
                    src={imagePreviewUrl}
                    alt="Preview"
                    className="w-48 h-48 object-cover rounded-lg border"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={reset}
                    className="flex-1 px-4 py-2 rounded-lg bg-gray-500 text-white font-semibold hover:bg-gray-600 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={findGenericMedicine}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-700 to-blue-500 text-white font-semibold disabled:opacity-50 hover:from-cyan-600 hover:to-blue-600 transition-all"
                  >
                    {isLoading ? "Analyzing..." : "Get Health Assistant"}
                  </button>
                </div>
              </motion.div>
            )}

            {step === "results" && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-lg p-6 text-black max-w-2xl mx-auto"
              >
                <div className="bg-gradient-to-r from-black via-[#006994] to-[#004f63]  p-4 rounded-2xl shadow-md w-full text-center mb-6 rounded-lg shadow-lg">
                  <h2 className="text-2xl font-semibold text-cyan-300">
                    Results
                  </h2>
                </div>
                {error && (
                  <p className="text-red-500 mb-4 text-center text-sm">
                    {error}
                  </p>
                )}
                {results.length === 0 && (
                  <div className="text-center text-gray-600">
                    No medicines found for the uploaded image.
                  </div>
                )}
                {results.map((medResult, idx) => (
                  <div key={idx} className="mb-10">
                    <div className="mb-6 max-w-md mx-auto p-6 bg-gradient-to-r from-black via-[#006994] to-[#004f63]  rounded-lg shadow-lg">
                      <h3 className="font-semibold text-xl text-center mb-4 text-sm text-cyan-200">
                        Original Medicine
                      </h3>
                      <table className="w-full border-collapse">
                        <thead className="bg-cyan-200">
                          <tr>
                            <th className="border border-gray-200 p-4 text-sm font-medium text-left">
                              Name
                            </th>
                            <th className="border border-gray-200 p-4 text-sm font-medium text-left">
                              Price
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-cyan-50">
                            <td className="border border-gray-200 p-4 text-sm">
                              {medResult.original_medicine_name}
                            </td>
                            <td className="border border-gray-200 p-4 text-sm">
                              {medResult.original_price}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    {Array.isArray(medResult.generic_medicine) &&
                      medResult.generic_medicine.length > 0 && (
                        <div className="max-w-full overflow-x-auto rounded-xl shadow-md border border-gray-200 p-4 bg-gradient-to-r from-black via-[#006994] to-[#004f63]">
                          <h3 className="font-bold text-lg text-cyan-200 text-center mb-4">
                            Generic Alternatives
                          </h3>
                          <div className="max-h-64 overflow-y-auto">
                            <table className="w-full border-collapse text-sm">
                              <thead className="bg-green-400 text-white sticky top-0 z-10">
                                <tr>
                                  <th className="p-3 text-left">Name</th>
                                  <th className="p-3 text-left">Price</th>
                                </tr>
                              </thead>
                              <tbody>
                                {medResult.generic_medicine.map(
                                  (med: any, index: number) => (
                                    <tr
                                      key={index}
                                      className={
                                        index % 2 === 0
                                          ? "bg-green-50"
                                          : "bg-green-100"
                                      }
                                    >
                                      <td className="p-3 border-t border-gray-200">
                                        {med.medicine_name}
                                      </td>
                                      <td className="p-3 border-t border-gray-200">
                                        {med.medicine_price}
                                      </td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                  </div>
                ))}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  className="mt-6 p-4 bg-yellow-50 border border-yellow-100 rounded-xl"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-yellow-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-1">
                        Important Medical Disclaimer
                      </h4>
                      <p className="text-sm text-yellow-700">
                        This assessment is for informational purposes only. The
                        medications listed above may not be suitable for your
                        specific condition. Always consult with a healthcare
                        professional before taking any medication.
                      </p>
                    </div>
                  </div>
                </motion.div>
                <button
                  onClick={reset}
                  className="mt-6 w-full px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-700 to-blue-500 text-white font-sm hover:from-cyan-600 hover:to-blue-600 transition-all"
                >
                  Try Another Image
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          <br />

          {/* How It Works Section */}
          <AnimatePresence>
            {step === "upload" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="bg-gradient-to-r from-[#004f63] to-blue-200 p-6 rounded-xl border-2 border-cyan-600 shadow-lg shadow-cyan-500/50 relative overflow-hidden mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-cyan-200/20 opacity-30 pointer-events-none"></div>
                  <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-white to-blue-400 text-transparent bg-clip-text underline decoration-cyan-400 decoration-2">
                    How it works:
                  </h3>
                  <ol className="list-none space-y-4 relative z-10 font-poppins">
                    <li className="flex items-center gap-3 group hover:bg-red-100/50 p-2 rounded-md transition-all duration-300">
                      <span className="flex items-center justify-center w-8 h-8 bg-cyan-600 text-white rounded-full text-sm font-semibold group-hover:scale-110 transition-transform">
                        1
                      </span>
                      <span className="text-white text-lg font-bold">
                        Upload a photo of your medicine
                      </span>
                    </li>
                    <li className="flex items-center gap-3 group hover:bg-red-100/50 p-2 rounded-md transition-all duration-300">
                      <span className="flex items-center justify-center w-8 h-8 bg-cyan-600 text-white rounded-full text-sm font-semibold group-hover:scale-110 transition-transform">
                        2
                      </span>
                      <span className="text-white text-lg font-bold">
                        Our AI analyzes the image
                      </span>
                    </li>
                    <li className="flex items-center gap-3 group hover:bg-red-100/50 p-2 rounded-md transition-all duration-300">
                      <span className="flex items-center justify-center w-8 h-8 bg-cyan-600 text-white rounded-full text-sm font-semibold group-hover:scale-110 transition-transform">
                        3
                      </span>
                      <span className="text-white text-lg font-bold">
                        We find a generic alternative
                      </span>
                    </li>
                    <li className="flex items-center gap-3 group hover:bg-red-100/50 p-2 rounded-md transition-all duration-300">
                      <span className="flex items-center justify-center w-8 h-8 bg-cyan-600 text-white rounded-full text-sm font-semibold group-hover:scale-110 transition-transform">
                        4
                      </span>
                      <span className="text-white text-lg font-bold">
                        Save money on your prescription!
                      </span>
                    </li>
                  </ol>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </>
  );
}