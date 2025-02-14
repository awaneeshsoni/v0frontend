import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UploadVideoModal from "../components/UploadVideoModel";
import CreateWorkspaceModal from "../components/CreateWorkspaceModel";

const API = import.meta.env.VITE_API_URL;

function Workspace() {
  const { wsid } = useParams();
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [videos, setVideos] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const res = await fetch(`${API}/api/workspace`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        setWorkspaces(data);
        const activeWorkspace = data.find((ws) => ws._id === wsid);
        setCurrentWorkspace(activeWorkspace || null);
      } catch (err) {
        console.error("Error fetching workspaces:", err);
      }
    };

    const fetchVideos = async () => {
      if (!wsid) return;
      try {
        const res = await fetch(`${API}/api/video?workspaceId=${wsid}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        setVideos(data.videos || []);
      } catch (err) {
        console.error("Error fetching videos:", err);
      }
    };

    fetchWorkspaces();
    fetchVideos();
  }, [wsid]);

  return (
    <div className="flex h-screen bg-[#0f172a] text-white">
      {/* Left Sidebar */}
      <div className="w-64 bg-[#1e293b] p-6 flex flex-col">
        <h2 className="text-xl font-bold flex items-center gap-2">🔥 Flame</h2>
        <h3 className="text-lg font-semibold mt-6">Workspaces</h3>
        <div className="mt-4 space-y-2">
          {workspaces.map((ws) => (
            <button
              key={ws._id}
              className={`w-full text-left px-4 py-2 rounded-md ${
                ws._id === wsid ? "bg-blue-500" : "bg-gray-700 hover:bg-gray-600"
              }`}
              onClick={() => navigate(`/workspace/${ws._id}`)}
            >
              {ws.name}
            </button>
          ))}
        </div>
        <div className="mt-auto">
      <button
        className="w-full bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-300"
        onClick={() => setShowModal(true)} // Open modal on button click
      >
        Create New Workspace
      </button>

      {/* Show the modal only when `showModal` is true */}
      {showModal && (
        <CreateWorkspaceModal
          setShowModal={setShowModal} // Pass state updater to close modal
          setWorkspaces={setWorkspaces} // Pass workspace state handler
        />
      )}
    </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10">
        <h2 className="text-3xl font-bold mb-6">
          {currentWorkspace ? `Videos in "${currentWorkspace.name}"` : "Loading..."}
        </h2>
        {videos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {videos.map((video) => (
              <div
                key={video._id}
                className="w-32 h-32 bg-gray-100 text-black rounded-lg shadow-md cursor-pointer hover:bg-gray-200 transition flex flex-col justify-between p-2"
                onClick={() => navigate(`video/${video._id}`)}
              >
                <div className="flex-1 flex items-center justify-center">📺</div>
                <h3 className="text-xs font-medium text-center text-gray-800 mt-2">
                  🎬 {video.title}
                </h3>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No videos found.</p>
        )}
      </div>

      {/* Right Sidebar */}
      <div className="w-64 bg-[#1e293b] p-6 flex flex-col">
        <button
          className="w-full bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600 mb-4"
          onClick={() => setShowUploadModal(true)}
        >
          Upload Video
        </button>
        <h3 className="text-lg font-semibold">Creator</h3>
        {currentWorkspace?.creator && (
          <div className="w-full text-left px-4 py-2 rounded-lg bg-gray-700 font-bold">
            {currentWorkspace.creator.name} (Creator)
          </div>
        )}

        <h3 className="text-lg font-semibold mt-4">Members</h3>
        <div className="mt-4 space-y-2 flex-1">
          {currentWorkspace?.members.length > 0 ? (
            currentWorkspace.members
              // .filter((member) => member._id !== currentWorkspace.creator._id) // Remove duplicate
              .map((member) => (
                <button
                  key={member._id}
                  className="w-full text-left px-4 py-2 rounded-lg bg-gray-600"
                >
                  {member.name}
                </button>
              ))
          ) : (
            <p className="text-gray-400">No members found.</p>
          )}
        </div>
        <button className="w-full bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600 mt-4">
          Add Member
        </button>
        <div className="mt-4 text-sm text-gray-400">Storage Used: 5GB / 20GB</div>
      </div>

      {showUploadModal && (
        <UploadVideoModal wsid={wsid} onClose={() => setShowUploadModal(false)} setVideos={setVideos} />
      )}
    </div>
  );
}

export default Workspace;
