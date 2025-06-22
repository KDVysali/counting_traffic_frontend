"use client";
import { useState } from "react";

export default function VideoUpload() {
  const [video, setVideo] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!video) return;

    const formData = new FormData();
    formData.append("video", video);

    setLoading(true);
    const response = await fetch("https://counting-traffic.onrender.com/process_video", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="p-8">
      <form onSubmit={handleUpload}>
        <input
          type="file"
          accept="video/mp4"
          onChange={(e) => setVideo(e.target.files?.[0] || null)}
        />
        <button
          type="submit"
          className="ml-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Processing..." : "Upload"}
        </button>
      </form>

      {result && (
        <div className="mt-4">
          <h2 className="text-lg font-bold">Vehicle Count</h2>
          <ul className="list-disc list-inside">
            {Object.entries(result).map(([type, count]) => (
              <li key={type}>{type}: {count}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
