"use client";
import Image from "next/image";
import Link from "next/link";
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function TrafficAnalyzer() {
  const [video, setVideo] = useState<File | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);

  const handleVideoUpload = async () => {
    if (!video) return;
    const formData = new FormData();
    formData.append("video", video);

    setLoading(true);
    try {
      const resp = await fetch("https://counting-traffic.onrender.com/process_video", {
        method: "POST",
        body: formData,
        mode: "cors",
      });

      if (!resp.ok) throw new Error("Processing failed – status " + resp.status);

      const data = await resp.json();
      console.log("✅ API response:", data);

      setCounts(data.summary || {});
      setProcessedVideoUrl(data.video_url || null);
    } catch (error) {
      console.error(error);
      alert("Upload or processing failed.");
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = (data: Record<string, number>) => {
    const header = "Vehicle Type,Count\n";
    const rows = Object.entries(data)
      .map(([type, count]) => `${type},${count}`)
      .join("\n");

    const csvContent = header + rows;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "vehicle_counts.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white"></div>
          <h1 className="text-xl font-bold">Traffic Analyzer</h1>
        </div>
        <div className="flex items-center">
          <nav className="hidden md:flex items-center mr-6">
            <Link href="#" className="px-4 py-2 font-medium">Dashboard</Link>
            <Link href="#" className="px-4 py-2 font-medium">Reports</Link>
            <Link href="#" className="px-4 py-2 font-medium">Settings</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full bg-gray-700">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Analyze Traffic Flow</h2>
          <p className="text-gray-400">Upload a video to analyze vehicle counts and details.</p>
        </div>

        {/* Upload Section */}
        <div className="relative rounded-lg overflow-hidden mb-8">
          <Image
            src="/placeholder.svg?height=400&width=1000&text=Traffic+Road+Scene"
            alt="Traffic road scene with vehicles"
            width={1000}
            height={400}
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-6">
            <h3 className="text-2xl font-bold mb-1">Upload Your Traffic Video</h3>
            <p className="text-gray-300 mb-4">Supports .mp4 format only</p>
            <input
              type="file"
              accept="video/mp4"
              onChange={(e) => setVideo(e.target.files?.[0] || null)}
              className="text-white"
            />
          </div>
          <Button
            className="absolute top-4 right-4 bg-[#f5f5dc] text-black hover:bg-[#e5e5c5]"
            onClick={handleVideoUpload}
            disabled={loading || !video}
          >
            {loading ? "Analyzing..." : "Start Analysis"}
          </Button>
        </div>

        {/* Live Output Section */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold mb-6">Live Output</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <VehicleCard type="Bicycles" count={counts["bicycle"] || 0} />
            <VehicleCard type="Motorcycles" count={counts["motorcycle"] || 0} />
            <VehicleCard type="Cars" count={counts["car"] || 0} />
            <VehicleCard type="Trucks" count={counts["truck"] || 0} />
            <VehicleCard type="Buses" count={counts["bus"] || 0} />
          </div>
        </div>

        {/* Download Section */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold mb-6">Download</h3>
          <div className="flex justify-center mb-8">
            <Button
              variant="secondary"
              className="bg-gray-700 hover:bg-gray-600 text-white"
              onClick={() => downloadCSV(counts)}
              disabled={!Object.keys(counts).length}
            >
              Download Vehicle Details CSV
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <h4 className="text-xl font-bold mb-2">Processed Video</h4>
              <p className="text-gray-400 mb-4">Download the processed video with vehicle detection</p>
              <Button
                variant="secondary"
                className="bg-gray-700 hover:bg-gray-600 text-white"
                onClick={() => {
                  if (processedVideoUrl) {
                    const link = document.createElement("a");
                    link.href = processedVideoUrl;
                    link.download = "processed_video.mp4";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }
                }}
                disabled={!processedVideoUrl}
              >
                Download
              </Button>
            </div>
            <div className="rounded-lg overflow-hidden">
              <Image
                src="/placeholder.svg?height=300&width=500&text=Processed+Video+with+Vehicle+Detection"
                alt="Processed video with vehicle detection overlay"
                width={500}
                height={300}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function VehicleCard({ type, count }: { type: string; count: number }) {
  return (
    <div className="bg-[#2a2a2a] rounded-lg p-4">
      <div className="text-gray-300 mb-2">{type}</div>
      <div className="text-3xl font-bold">{count}</div>
    </div>
  );
}
