import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getLogsRequest } from "../redux/slices/testSlice";

const EventLogs = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { attemptId, logs, loading } = useSelector((state) => state.test);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!attemptId) {
      navigate("/home");
      return;
    }

    // Fetch logs
    dispatch(getLogsRequest(attemptId));

    // Poll for new logs every 5 seconds
    const interval = setInterval(() => {
      dispatch(getLogsRequest(attemptId));
    }, 5000);

    return () => clearInterval(interval);
  }, [attemptId, dispatch, navigate]);

  const handleBack = () => {
    navigate("/test");
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatEventType = (eventType) => {
    return eventType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const filteredLogs = logs.filter((log) => {
    if (filter === "violations") return log.is_violation;
    if (filter === "non-violations") return !log.is_violation;
    return true;
  });

  const violationCount = logs.filter((log) => log.is_violation).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 bg-slate-200 px-3 py-1.5 rounded-md transition-colors"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Test
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Event Logs</h1>
              <p className="text-sm text-gray-600 mt-1">
                Showing {filteredLogs.length} of {logs.length} events
              </p>
            </div>
            <button
              onClick={() => dispatch(getLogsRequest(attemptId))}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <svg
                className="h-5 w-5 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          </div>

          {/* Info Banner */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-yellow-800">
                Events are sent in batches every 15 seconds
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-1.5 rounded-lg font-medium transition-colors ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setFilter("violations")}
              className={`px-4 py-1.5 rounded-lg font-medium transition-colors ${
                filter === "violations"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Violations Only
            </button>
            <button
              onClick={() => setFilter("non-violations")}
              className={`px-4 py-1.5 rounded-lg font-medium transition-colors ${
                filter === "non-violations"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Non-Violations
            </button>
          </div>

          {/* Logs List */}
          {loading && logs.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading events...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="mt-4 text-gray-600">No events found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-4 rounded-lg border ${
                    log.is_violation
                      ? "bg-red-50 border-red-200"
                      : "bg-green-50 border-green-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {log.is_violation ? (
                        <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <svg
                            className="h-5 w-5 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                        </div>
                      ) : (
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg
                            className="h-5 w-5 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1">
                        <h3
                          className={`font-medium ${log.is_violation ? "text-red-900" : "text-gray-900"}`}
                        >
                          {formatEventType(log.event_type)}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatTimestamp(log.timestamp)}
                        </p>
                        {log.event_data?.message && (
                          <p className="text-sm text-gray-700 mt-2">
                            {log.event_data.message}
                          </p>
                        )}
                      </div>
                    </div>
                    {log.is_violation && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Violation
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Violation Summary */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center">
              <p className="text-base text-gray-600">
                Total violations:{" "}
                <span className="font-semibold text-red-600">
                  {violationCount}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventLogs;
