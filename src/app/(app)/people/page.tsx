"use client";
import { Users, Search, Trash2, RefreshCw, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import RegisterPeople from "@/components/RegisterPeople";

interface User {
  name: string;
  info?: string;
}

export default function PeoplePage() {
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const loadUsers = async () => {
    try {
      const response = await fetch("/api/users/people");
      if (response.ok) {
        const data = await response.json();
        setRegisteredUsers(data.users || []);
      }
    } catch (error) {
      console.log("No users found yet");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const deleteUser = async (userName: string) => {
    if (!confirm(`Are you sure you want to delete ${userName}?`)) return;
    
    try {
      const response = await fetch(`/api/users/people?name=${encodeURIComponent(userName)}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadUsers();
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = registeredUsers.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-lime-400 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-white text-xl">Loading users...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2">
                People Management
              </h1>
              <p className="text-neutral-400 text-sm sm:text-base lg:text-lg">
                Manage registered users in your face recognition system
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-black border border-lime-400/20 rounded-xl px-4 sm:px-6 py-2 sm:py-3">
                <div className="flex justify-center text-lime-400 text-2xl sm:text-3xl font-bold">
                  {registeredUsers.length}
                </div>
                <div className="text-neutral-400 text-xs sm:text-sm">Total Users</div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="bg-stone-950 border-2 border-black rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col gap-4">
            <div className="relative w-full">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-neutral-500 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm sm:text-base placeholder-neutral-500 focus:outline-none focus:border-lime-400 transition"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white rounded-xl font-medium transition disabled:opacity-50 text-sm sm:text-base"
              >
                <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="sm:inline">Refresh</span>
              </button>
              <div className="w-full sm:w-auto">
                <RegisterPeople
                  onRegistrationComplete={() => {
                    console.log("User registered!");
                    loadUsers();
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Users Grid */}
        <div className="bg-stone-950 border-2 border-black rounded-2xl p-4 sm:p-6">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Users className="w-10 h-10 sm:w-12 sm:h-12 text-neutral-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                {searchQuery ? 'No users found' : 'No users registered yet'}
              </h3>
              <p className="text-neutral-500 mb-4 sm:mb-6 text-sm sm:text-base px-4">
                {searchQuery 
                  ? `No users match "${searchQuery}"`
                  : 'Get started by registering your first user'}
              </p>
              {!searchQuery && (
                <div className="flex justify-center">
                  <RegisterPeople
                    onRegistrationComplete={() => {
                      console.log("User registered!");
                      loadUsers();
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <Users size={20} className="text-lime-400 sm:w-6 sm:h-6" />
                  <span className="hidden sm:inline">
                    {searchQuery ? `Search Results (${filteredUsers.length})` : `All Users (${filteredUsers.length})`}
                  </span>
                  <span className="sm:hidden">
                    {searchQuery ? `Results (${filteredUsers.length})` : `Users (${filteredUsers.length})`}
                  </span>
                </h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {filteredUsers.map((user, index) => (
                  <div
                    key={index}
                    className="group bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 hover:border-lime-400/50 rounded-xl p-4 sm:p-5 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-lime-400 to-lime-500 rounded-full flex items-center justify-center text-black font-bold text-lg sm:text-xl shadow-lg">
                            {user.name[0].toUpperCase()}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold text-base sm:text-lg truncate mb-1">
                            {user.name}
                          </h3>
                          {user.info ? (
                            <p className="text-neutral-400 text-xs sm:text-sm line-clamp-2">
                              {user.info}
                            </p>
                          ) : (
                            <p className="text-neutral-500 text-xs sm:text-sm italic">
                              No additional info
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => deleteUser(user.name)}
                        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 rounded-lg transition-all duration-200 flex-shrink-0"
                        title={`Delete ${user.name}`}
                      >
                        <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Stats Footer */}
        {registeredUsers.length > 0 && (
          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-neutral-400 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-lime-400 rounded-full"></div>
              <span>{registeredUsers.length} Total Users</span>
            </div>
            {searchQuery && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>{filteredUsers.length} Matching Results</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}