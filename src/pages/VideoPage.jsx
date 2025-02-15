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
                setError("Failed to load video. Maybe the video is private or server error!");
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

        setError(""); // Clear previous errors
        const timestamp = videoRef.current.currentTime.toFixed(2); // Ensure timestamp is captured

        const newComment = { name, text: commentText, timestamp };

        try {
            const res = await fetch(`${API}/api/video/${id}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newComment),
            });

            const data = await res.json();
            console.log("New comment response:", data);

            if (res.ok) {
                setComments([...comments, newComment]); // Ensure new comment is added properly
                setCommentText(""); // Clear input
                videoRef.current.play(); // Resume video
            }
        } catch (err) {
            console.error("Error adding comment:", err);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#0f172a] text-white">
            {/* Mobile Navbar */}
            <nav className="md:hidden flex justify-between items-center p-4 bg-[#1e293b] sticky top-0 z-50">
                <div className="flex items-center space-x-2 text-xl font-bold">
                    <span>🔥</span>
                    <h2>Flame</h2>
                </div>
            </nav>

            {/* Desktop Layout */}
            <div className="hidden md:flex h-full">
                {/* Main Content */}
                <div className="flex-1 p-6 flex flex-col">
                    {/* Video Section */}
                    <div className="flex h-[80vh] flex-wrap md:flex-nowrap gap-6">
                        <div className="flex-1 flex flex-col">
                            <h2 className="text-2xl font-bold mb-2 truncate"> {/* Added truncate here */}
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
                            {(
                                <div className="w-full p-2 border rounded mb-2 bg-[#1e293b] text-white flex items-center">
                                    <span className="mr-2 opacity-50">Name:</span>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="bg-transparent border-none outline-none flex-1 text-white"
                                    />
                                </div>
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
                                                if (videoRef?.current) {
                                                    console.log("Setting time to:", c.timestamp);
                                                    videoRef.current.currentTime = parseFloat(c.timestamp);
                                                    // videoRef.current.play(); // Optional: Auto-play after seeking
                                                } else {
                                                    console.error("VideoRef is null");
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
                                    onFocus={() => {
                                        if (videoRef.current) {
                                            videoRef.current.pause();
                                        }
                                    }}
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

            {/* Mobile Main Content and Comments  */}
            <div className="md:hidden flex-1 p-4">
                <h2 className="text-2xl font-bold mb-2 truncate"> {/* Added truncate here */}
                    {video ? video.title : "Loading..."}
                </h2>

                {/* Video Section - Mobile */}
                <div className="mb-4">
                    {isLoading ? (
                        <div className="w-full aspect-video flex items-center justify-center bg-gray-800">
                            <div className="animate-spin border-4 border-gray-400 border-t-white rounded-full w-12 h-12"></div>
                        </div>
                    ) : (
                        <video ref={videoRef} controls className="w-full aspect-video">
                            <source src={video?.url} type="video/mp4" />
                        </video>
                    )}
                </div>

                {/* Comments Section - Mobile */}
                <div className="bg-[#1e293b] p-4 rounded-lg shadow flex flex-col">
                    <h3 className="text-xl font-bold mb-3">Comments</h3>
                    <h5 className="text-sm mb-3">
                        Click a comment to jump to that moment
                    </h5>

                    {/* Error Message */}
                    {error && <p className="text-red-500 mb-2">{error}</p>}

                    {/* Name Input */}
                    {(
                        <div className="w-full p-2 border rounded mb-2 bg-[#1e293b] text-white flex items-center">
                            <span className="mr-2 opacity-50">Name:</span>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-transparent border-none outline-none flex-1 text-white"
                            />
                        </div>
                    )}

                    {/* Comments List (Scrollable) */}
                    <div className="flex-1 overflow-y-auto max-h-[50vh]">
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

                    {/* Comment Input and Button (Fixed at Bottom) */}
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
    );
}

export default VideoPage;