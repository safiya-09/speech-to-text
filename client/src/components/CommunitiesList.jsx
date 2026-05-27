import React, { useState, useEffect } from "react";
import { getCommunities, createCommunity } from "../services/api";
import { Plus, Users, Search, Folder, Globe, X, Check, ShieldAlert } from "lucide-react";

export default function CommunitiesList() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [joinedCommunities, setJoinedCommunities] = useState({});

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    name: "",
    description: "",
    category: "General",
  });
  const [modalError, setModalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ["General", "Technology", "Education", "Entertainment", "Business", "Health"];

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const res = await getCommunities();
      if (res.success) {
        setCommunities(res.data);
      }
    } catch (err) {
      setError("Failed to fetch communities.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const handleJoin = (id) => {
    setJoinedCommunities((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setModalError("");

    if (!newCommunity.name.trim()) {
      setModalError("Community name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await createCommunity(newCommunity);
      if (res.success) {
        setCommunities((prev) => [res.data, ...prev]);
        setIsModalOpen(false);
        setNewCommunity({ name: "", description: "", category: "General" });
      }
    } catch (err) {
      setModalError(err.message || "Failed to create community");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCommunities = communities.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Transcription Communities</h2>
          <p className="text-xs text-slate-400 mt-1">Connect, share and discuss transcripts in collaborative rooms</p>
        </div>

        <div className="flex gap-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search rooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-48 pl-9 pr-4 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-md shadow-purple-950/20 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Create</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-950/30 border border-red-900/50 rounded-xl text-red-400 text-sm mb-6">
          <ShieldAlert className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-slate-400">Opening directory...</p>
        </div>
      ) : filteredCommunities.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-800/80 rounded-xl bg-slate-950/15">
          <Globe className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No rooms found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            {searchQuery
              ? "No spaces match your keywords. Try another search term!"
              : "No community spaces have been created yet. Be the first to build one!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCommunities.map((c) => {
            const isJoined = joinedCommunities[c._id];
            const memberCount = (c.members?.length || 0) + (isJoined ? 1 : 0);

            return (
              <div
                key={c._id}
                className="group relative flex flex-col bg-slate-950/35 hover:bg-slate-950/60 border border-slate-800/80 hover:border-purple-500/30 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-purple-950/5"
              >
                {/* Banner Gradient Placeholder */}
                <div
                  className="h-16 w-full bg-cover bg-center opacity-70 group-hover:opacity-85 transition-opacity"
                  style={{ backgroundImage: `url(${c.banner})` }}
                />

                {/* Avatar positioning */}
                <div className="absolute left-4 top-8 h-12 w-12 rounded-xl border-2 border-slate-950 overflow-hidden bg-slate-900 shadow-md">
                  <img
                    src={c.avatar}
                    alt={c.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Card Content */}
                <div className="flex-1 p-4 pt-6 mt-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold tracking-wider rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                        <Folder className="h-2.5 w-2.5" />
                        {c.category}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-200 group-hover:text-purple-300 transition-colors">
                      {c.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2 h-8">
                      {c.description || "No description provided for this group space."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-900 mt-4 pt-3.5 text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-medium">
                      <Users className="h-3.5 w-3.5 text-slate-500" />
                      {memberCount} {memberCount === 1 ? "member" : "members"}
                    </span>

                    <button
                      onClick={() => handleJoin(c._id)}
                      className={`flex items-center gap-1.5 font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                        isJoined
                          ? "bg-purple-950/15 border-purple-500/40 text-purple-400"
                          : "bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300 hover:text-white"
                      }`}
                    >
                      {isJoined ? (
                        <>
                          <Check className="h-3 w-3" />
                          <span>Joined</span>
                        </>
                      ) : (
                        <span>Join Room</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm animate-fade-in p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-850 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-100 mb-1">Create Community Space</h3>
            <p className="text-xs text-slate-400 mb-5">Create a dedicated group for sharing specific transcripts</p>

            {modalError && (
              <div className="flex items-center gap-2 p-3 bg-red-950/30 border border-red-900/50 rounded-xl text-red-400 text-xs mb-4">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Community Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Design Syncs, Class of 2026"
                  required
                  value={newCommunity.name}
                  onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={newCommunity.category}
                  onChange={(e) => setNewCommunity({ ...newCommunity, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 text-sm focus:outline-none focus:border-purple-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  placeholder="Briefly describe the channel topic or group purpose..."
                  rows={3}
                  value={newCommunity.description}
                  onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-white rounded-xl text-sm font-semibold transition-colors shadow-md shadow-purple-950/20"
                >
                  {isSubmitting ? "Building Room..." : "Create Room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
