import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
const API = import.meta.env.VITE_API_URL;

function VideoPage() {
    const { id } = useParams(); // Corrected: Use 'id' (as defined in your route)
    const [video, setVideo] = useState(null);
    const [comments, setComments] = useState(null);
    const [commentText, setCommentText] = useState("");
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const videoRef = useRef(null);

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                // Fetch the video using the share endpoint (no auth needed)
                const res = await fetch(`${API}/api/video/share/${id}`); // Corrected: Use 'id'
                const data = await res.json();
                if (res.ok) {
                    setVideo(data);
                    setComments(data.comments || []);
                } else {
                    throw new Error(data.message || 'Failed to fetch video');
                }
            } catch (err) {
                console.error("Error fetching video:", err);
                setError(err.message || "Failed to load video.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchVideo();
    }, [id]); // Corrected: Use 'id' in the dependency array

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
        const newComment = { name, text: commentText, timestamp };

        try {
            // Post the comment (no auth needed for the shared page)
            const res = await fetch(`${API}/api/video/${id}/comments`, { // Corrected: Use 'id'
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newComment),
            });

            const data = await res.json();

            if (res.ok) {
                // Update comments with the returned data (includes _id, etc.)
                setComments(prevComments => [...(prevComments || []), data]);
                setCommentText("");
                setName(""); // Clear name after submitting
                videoRef.current.play();
            } else {
                throw new Error(data.message || 'Failed to add comment');
            }
        } catch (err) {
            console.error("Error adding comment:", err);
            setError(err.message || 'Failed to add comment');
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#0f172a] text-white">
            {/* Header */}
            <div className="p-4 bg-[#1e293b] flex items-center">
                <h1 className="text-xl font-bold flex items-center gap-2">🔥 Flame</h1>
            </div>

            {/* Main Content (Video and Comments) */}
            <div className="p-6 max-h-[85vh] flex flex-wrap md:flex-nowrap gap-6 flex-grow">
                {/* Video Section */}
                <div className="flex-1 flex flex-col">
                    <h2 className="text-2xl font-bold mb-4">
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

                    {/* Name Input (Always shown on shared page) */}
                    <input
                        type="text"
                        placeholder="Your Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2 border rounded mb-2 bg-[#1e293b] text-white placeholder-gray-400"
                    />

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
    );
}

export default VideoPage;