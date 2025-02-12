import { useState } from "react";

function CreateWorkspaceModal({ setShowModal, setWorkspaces }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Workspace name is required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/workspace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create workspace.");

      setWorkspaces((prev) => [...prev, data]); // Add new workspace to list
      setShowModal(false); // Close modal
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4">Create Workspace</h2>
        
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        
        <input
          type="text"
          placeholder="Workspace Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />

        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            onClick={() => setShowModal(false)}
            disabled={loading}
          >
            Cancel
          </button>
          
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? <span className="loader mr-2"></span> : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateWorkspaceModal;
