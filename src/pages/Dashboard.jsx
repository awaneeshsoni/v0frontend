import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import CreateWorkspaceModal from "../components/CreateWorkspaceModel";

function Dashboard() {
  const [workspaces, setWorkspaces] = useState([]);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);


  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/workspace", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        if (res.ok) setWorkspaces(data);
      } catch (err) {
        console.error("Error fetching workspaces:", err);
      }
    };

    fetchWorkspaces();
  }, []);

  const placeholderWorkspaces = [
    { _id: "1", name: "Example Workspace 1" },
    { _id: "2", name: "Example Workspace 2" },
  ];

  return (
    <>
      <Navbar />
      <div className="p-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-4xl font-bold">Your Workspaces</h2>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          onClick={() => setShowModal(true)}
        >
          + Create Workspace
        </button>
      </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...placeholderWorkspaces, ...workspaces].map((ws) => (
            <div
              key={ws._id}
              className="p-6 border rounded-xl shadow-lg cursor-pointer bg-gray-100 hover:bg-gray-200 transition transform hover:scale-105 flex items-center justify-center"
              onClick={() => navigate(`/workspace/${ws._id}`)}
            >
              <h3 className="text-lg font-medium">{ws.name}</h3>
            </div>
          ))}
        </div>
        {showModal && <CreateWorkspaceModal setShowModal={setShowModal} setWorkspaces={setWorkspaces} />}
      </div>
    </>
  );
}

export default Dashboard;
