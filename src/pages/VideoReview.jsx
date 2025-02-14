import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
const API = import.meta.env.VITE_API_URL;

function VideoPage() {
    const { wsid, vid } = useParams();
    const [video, setVideo] = useState(null);
    const [comments, setComments] = useState(null);
    const [commentText, setCommentText] = useState("");
    const [name, setName] = useState(localStorage.getItem("username") || "");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const videoRef = useRef(null);
    const [isPublic, setIsPublic] = useState(null);
    const [shareUrl, setShareUrl] = useState("");
    const [workspaces, setWorkspaces] = useState([]);
    const [selectedWorkspaceName, setSelectedWorkspaceName] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchWorkspaces = async () => {
            try {
                const res = await fetch(`${API}/api/workspace`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || "Failed to fetch workspaces");
                }

                const data = await res.json();
                setWorkspaces(data);
            } catch (err) {
                console.error("Error fetching workspaces:", err);
            }
        };

        fetchWorkspaces();
    }, []);


    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const res = await fetch(`${API}/api/video/share/${vid}`, {
                    // headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                const data = await res.json();
                if (res.ok) {
                    setVideo(data);
                    setComments(data.comments || []);
                    setIsPublic(data.isPublic);
                    if (data.isPublic) {
                        setShareUrl(`${window.location.origin}/video/share/${data.shareId}`);
                    }

                    // Fetch workspace name.  Crucially, use workspaceId, not workspace
                    if (data.workspace) { // Corrected: Check for data.workspace
                        const workspaceRes = await fetch(`${API}/api/workspace/${data.workspace}`, { // Corrected: data.workspace
                            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                        });
                        if (workspaceRes.ok) {
                            const workspaceData = await workspaceRes.json();
                            setSelectedWorkspaceName(workspaceData.name);
                        } else {
                            console.error("Failed to fetch workspace for video");
                        }
                    }

                }
            } catch (err) {
                console.error("Error fetching video:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVideo();
    }, [vid]);

    const handleAddComment = async () => {
        if (!name.trim()) {
            setError("Please enter your name.");
            return;
        }
        if (!commentText.trim()) {
            setError("Comment cannot be empty.");
            return;
        }

        setError("");
        const timestamp = videoRef.current.currentTime.toFixed(2);

        // Correctly use the 'name' from the state
        const newComment = { name: name, text: commentText, timestamp };

        try {
            const res = await fetch(`${API}/api/video/${vid}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(newComment),
            });

            const data = await res.json();

            if (res.ok) {
                // VERY IMPORTANT: Use the returned comment data (data) from the server.
                setComments(prevComments => [...(prevComments || []), data]);
                setCommentText("");
                // Reset name to localStorage value (or empty string) after adding comment
                setName(localStorage.getItem("username") || "");
                videoRef.current.play();
            } else {
                throw new Error(data.message || 'Failed to add comment');
            }
        } catch (err) {
            console.error("Error adding comment:", err);
            setError(err.message || "Failed to add comment");
        }
    };



    const handlePrivacyChange = async (newIsPublic) => {
        try {
            // const res = await fetch(`${API}/api/video/${vid}/privacy`, {
            //     method: "PATCH",
            //     headers: {
            //         "Content-Type": "application/json",
            //         Authorization: `Bearer ${localStorage.getItem("token")}`,
            //     },
            //     body: JSON.stringify({ isPublic: newIsPublic }),
            // });

            // const data = await res.json();
            if (res.ok) {
                setIsPublic(newIsPublic);
                if (newIsPublic) {
                    setShareUrl(`${window.location.origin}/video/share/${data.shareId}`);
                } else {
                    setShareUrl("");
                }
            } else {
                throw new Error(data.message || "Failed to update privacy setting");
            }
        } catch (err) {
            console.error("Error changing privacy:", err);
            setError(err.message || "Failed to change privacy settings.");
        }
    };

    const handleShare = () => {
        if (isPublic && shareUrl) {
            navigator.clipboard.writeText(shareUrl)
                .then(() => {
                    alert("Share URL copied to clipboard!");
                })
                .catch((err) => {
                    console.error("Failed to copy:", err);
                    alert("Failed to copy URL. Please copy manually.");
                });
        }
    };


    return (
        <div className="flex h-screen bg-[#0f172a] text-white">
            {/* Left Sidebar (Workspace List) */}
            <div className="w-64 bg-[#1e293b] p-6 flex flex-col">
                <h2 className="text-xl font-bold flex items-center gap-2">🔥 Flame</h2>
                <h3 className="text-lg font-semibold mt-6">Workspaces</h3>
                <div className="mt-4 space-y-2 overflow-y-auto flex-grow">
                    {workspaces.map((workspace) => (
                        <button
                            key={workspace._id}
                            className={`w-full text-left px-4 py-2 rounded-lg  bg-gray-600 hover:bg-gray-500`}
                            onClick={() => navigate(`/workspace/${workspace._id}`)}
                        >
                            {workspace.name}
                        </button>
                    ))}
                </div>
                <div className="mt-auto">
                    <button
                        className="w-full bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600"
                        onClick={() => navigate("/create-workspace")}
                    >
                        Create New Workspace
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6 flex flex-col">
                {/* Top Bar (Privacy and Share) */}
                <div className="w-full flex justify-end items-center mb-4">
                    <select
                        value={isPublic === null ? "" : (isPublic ? "public" : "private")}
                        onChange={(e) => handlePrivacyChange(e.target.value === "public")}
                        className="bg-[#1e293b] text-white px-4 py-2 rounded mr-2"
                        disabled={isPublic === null}
                    >
                        <option value="" disabled>Loading...</option>
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                    </select>
                    <button
                        className={`px-4 py-2 rounded ${isPublic ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-500 cursor-not-allowed"
                            }`}
                        onClick={handleShare}
                        disabled={!isPublic}
                    >
                        Share
                    </button>
                </div>

                {/* Video and Comments Section */}
                <div className="flex h-[80vh] flex-wrap md:flex-nowrap gap-6">
                    {/* Video Section */}
                    <div className="flex-1 flex flex-col">
                        <h2 className="text-2xl font-bold mb-2">
                            {selectedWorkspaceName && (
                                <span className="text-lg font-semibold text-gray-400 mr-2">
                                    {selectedWorkspaceName} /
                                </span>
                            )}
                            {video ? video.title : "Loading..."}
                        </h2>
                        <div className="flex-1 overflow-hidden">
                            {isLoading ? (
                                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                    <div className="animate-spin border-4 border-gray-400 border-t-white rounded-full w-12 h-12"></div>
                                </div>
                            ) : (
                                <video ref={videoRef} controls className="w-full h-full object-contain">
                                    <source src={video?.url} type="video/mp4" />
                                </video>
                            )}
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="w-80 bg-[#1e293b] p-4 rounded-lg shadow flex flex-col">
                        <h3 className="text-xl font-bold mb-3">Comments</h3>
                        <h5 className="text-sm mb-3">
                            Click the comment to see the frame the comment was related to
                        </h5>

                        {/* Error Message */}
                        {error && <p className="text-red-500 mb-2">{error}</p>}

                        {/* Name Input */}
                        {!localStorage.getItem("username") && (
                            <input
                                type="text"
                                placeholder="Your Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-2 border rounded mb-2 bg-[#1e293b] text-white placeholder-gray-400"
                            />
                        )}

                        {/* Comments List (Scrollable) */}
                        <div className="flex-1 overflow-y-auto">
                            {comments === null ? (
                                <div className="flex justify-center">
                                    <div className="animate-spin border-4 border-gray-400 border-t-white rounded-full w-8 h-8"></div>
                                </div>
                            ) : (
                                comments.map((c, index) => (
                                    <div
                                        key={index}
                                        className="p-2 bg-[#283449] rounded cursor-pointer mb-2"
                                        onClick={() => {
                                            if (c.timestamp !== undefined) {
                                                videoRef.current.currentTime = parseFloat(c.timestamp);
                                            }
                                        }}
                                    >
                                        <p className="text-sm font-bold text-white">{c.name || "Unknown"}</p>
                                        <p className="text-white">{c.text || "No comment text"}</p>
                                        <p className="text-xs text-gray-400">
                                            ⏳{" "}
                                            {c.timestamp !== undefined
                                                ? parseFloat(c.timestamp).toFixed(2) + "s"
                                                : "No timestamp"}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Comment Input and Button (Fixed at Bottom) */}
                        <div className="mt-auto">
                            <textarea
                                placeholder="Add a comment..."
                                value={commentText}
                                onFocus={() => videoRef.current.pause()}
                                onChange={(e) => setCommentText(e.target.value)}
                                className="w-full p-2 border rounded bg-[#1e293b] text-white placeholder-gray-400"
                            />
                            <button
                                className="w-full bg-blue-500 text-white py-2 rounded mt-2"
                                onClick={handleAddComment}
                            >
                                Add Comment
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VideoPage;