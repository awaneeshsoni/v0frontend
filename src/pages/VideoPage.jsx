import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
const API = import.meta.env.VITE_API_URL;

function VideoPage() {
    const { id } = useParams();
    const [video, setVideo] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [name, setName] = useState(localStorage.getItem("username") || "");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const videoRef = useRef(null);

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const res = await fetch(`${API}/api/video/share/${id}`);
                if (!res.ok) throw new Error("Failed to fetch video");

                const data = await res.json();
                setVideo(data);
                setComments(data.comments || []);
                setIsLoading(false);
            } catch (err) {
                console.error("Error fetching video:", err);
                setError("Failed to load video.");
                setIsLoading(false);
            }
        };

        fetchVideo();
    }, [id]);

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
        const timestamp = videoRef.current?.currentTime?.toFixed(2) || "0.00";

        const newComment = { name, text: commentText, timestamp };

        try {
            const res = await fetch(`${API}/api/video/${id}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`, // If required
                },
                body: JSON.stringify(newComment),
            });

            if (!res.ok) throw new Error("Failed to add comment");

            const data = await res.json();
            setComments((prev) => [...prev, data]);
            setCommentText("");
            setName(localStorage.getItem("username") || ""); // Reset name if not stored

            videoRef.current?.play(); // Resume playback
        } catch (err) {
            console.error("Error adding comment:", err);
            setError(err.message || "Failed to add comment");
        }
    };

    return (
        <div className="flex h-screen bg-[#0f172a] text-white">
            {/* Main Content */}
            <div className="flex-1 p-6 flex flex-col">
                {/* Video Section */}
                <div className="flex h-[80vh] flex-wrap md:flex-nowrap gap-6">
                    <div className="flex-1 flex flex-col">
                        <h2 className="text-2xl font-bold mb-2">
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
                        <h5 className="text-sm mb-3">Click a comment to jump to that moment</h5>

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

                        {/* Comments List */}
                        <div className="flex-1 overflow-y-auto">
                            {comments.length === 0 ? (
                                <p className="text-gray-400 text-center">No comments yet.</p>
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
                                            ⏳ {c.timestamp !== undefined ? `${parseFloat(c.timestamp).toFixed(2)}s` : "No timestamp"}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Comment Input & Button */}
                        <div className="mt-auto">
                            <textarea
                                placeholder="Add a comment..."
                                value={commentText}
                                onFocus={() => videoRef.current?.pause()}
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
