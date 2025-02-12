import { useState } from "react";
const API = import.meta.env.VITE_API_URL

function UploadVideoModal({ wsid, onClose, setVideos }) {
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setVideoFile(e.target.files[0]);
    setError(null);
  };

  const handleUpload = async () => {
    if (!videoFile) {
      setError("Please select a video.");
      return;
    }

    setUploading(true);
    setProgress(10);

    const formData = new FormData();
    formData.append("video", videoFile);
    formData.append("workspaceId", wsid);

    try {
      const res = await fetch(`${API}/api/video/upload`, {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setVideos((prev) => [...prev, data.video]); // Add new video to list
      setProgress(100);
      setTimeout(onClose, 1000); // Close modal after success
    } catch (err) {
      setError("Upload failed. Try again.");
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Upload Video</h2>

        <input type="file" accept="video/*" onChange={handleFileChange} className="mb-4 w-full" />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        {uploading && (
          <div className="relative w-full bg-gray-200 rounded h-3 overflow-hidden">
            <div
              className="bg-blue-500 h-3 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="flex justify-end mt-4 space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UploadVideoModal;
