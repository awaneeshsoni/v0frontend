import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UploadVideoModal from "../components/UploadVideoModel";
const API = import.meta.env.VITE_API_URL
function Workspace() {
  const { wsid } = useParams();
  const [videos, setVideos] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch(`${API}/api/video?workspaceId=${wsid}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        const data = await res.json();
        if (res.ok) setVideos(data.videos || []);
      } catch (err) {
        console.error("Error fetching videos:", err);
      }
    };

    fetchVideos();
  }, [wsid]);

  const placeholderVideos = [
    { _id: "1", title: "Sample Video 1" },
    { _id: "2", title: "Sample Video 2" },
  ];

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-4xl font-bold">Videos in this Workspace</h2>
        <button
          className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600"
          onClick={() => setShowUploadModal(true)}
        >
          Upload Video
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...placeholderVideos, ...videos].map((video) => (
          <div
            key={video._id}
            className="p-6 border rounded-xl shadow-lg cursor-pointer bg-gray-100 hover:bg-gray-200 transition transform hover:scale-105 flex items-center justify-center"
            onClick={() => navigate(`video/${video._id}`)}
          >
            <h3 className="text-lg font-medium">{video.title}</h3>
          </div>
        ))}
      </div>

      {showUploadModal && (
        <UploadVideoModal wsid={wsid} onClose={() => setShowUploadModal(false)} setVideos={setVideos} />
      )}
    </div>
  );
}

export default Workspace;
