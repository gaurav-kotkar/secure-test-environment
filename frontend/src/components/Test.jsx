import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  incrementViolation,
  submitTestRequest,
} from "../redux/slices/testSlice";
import { logout } from "../redux/slices/authSlice";
import EventLogger from "../utils/eventLogger";
import store from "../redux/store";

const Test = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { attemptId, violationCount, loading, testSubmitted } = useSelector(
    (state) => state.test,
  );
  const [showWarning, setShowWarning] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const eventLoggerRef = useRef(null);
  const [answers, setAnswers] = useState({
    q1: "",
    q2: "",
  });

  useEffect(() => {
    if (!attemptId) {
      navigate("/home");
      return;
    }

    // Initialize event logger
    eventLoggerRef.current = new EventLogger(store);
    eventLoggerRef.current.initialize(attemptId);

    // Log test started
    eventLoggerRef.current.logEvent("test_started", {
      fullscreen: !!document.fullscreenElement,
    });

    // Add event listeners for violations
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation("Tab Switch Detected", "tab_switch");
      } else {
        eventLoggerRef.current?.logEvent("focus_restored", {
          previousState: "hidden",
        });
      }
    };

    const handleBlur = () => {
      handleViolation("Window Focus Lost", "window_blur");
    };

    const handleFocus = () => {
      eventLoggerRef.current?.logEvent("focus_restored", {
        previousState: "blur",
      });
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        handleViolation("Exited Fullscreen Mode", "fullscreen_exit");
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      handleViolation("Right-Click Attempt Detected", "right_click_attempt");
    };

    const handleCopy = (e) => {
      e.preventDefault();
      handleViolation("Copy Attempt Detected", "copy_attempt");
    };

    const handlePaste = (e) => {
      e.preventDefault();
      handleViolation("Paste Attempt Detected", "paste_attempt");
    };

    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        if (["c", "v", "x", "f12", "i"].includes(key)) {
          e.preventDefault();
          const keyName = e.key.toUpperCase();
          handleViolation(
            `Keyboard Shortcut Detected: Ctrl+${keyName}`,
            "keyboard_shortcut",
          );
        }
      }

      if (e.key === "F12") {
        e.preventDefault();
        handleViolation("F12 Key Detected", "keyboard_shortcut");
      }
    };

    // Add listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("keydown", handleKeyDown);

    // Request fullscreen
    document.documentElement.requestFullscreen().catch((err) => {
      console.warn("Fullscreen request failed:", err);
    });

    // Cleanup
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("keydown", handleKeyDown);

      if (eventLoggerRef.current) {
        eventLoggerRef.current.finalFlush();
      }
    };
  }, [attemptId, navigate]);

  // Handle test submission redirect
  useEffect(() => {
    if (testSubmitted) {
      setTimeout(() => {
        dispatch(logout());
        localStorage.removeItem("token");
        navigate("/login", {
          state: {
            message:
              "Test submitted successfully! You can login again to take another test.",
          },
        });
      }, 2000);
    }
  }, [testSubmitted, navigate, dispatch]);

  const handleViolation = (message, eventType) => {
    setWarningMessage(message);
    setShowWarning(true);
    dispatch(incrementViolation());

    if (eventLoggerRef.current) {
      eventLoggerRef.current.logEvent(
        eventType,
        {
          message,
        },
        true,
      );
    }

    setTimeout(() => {
      setShowWarning(false);
    }, 3000);
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers({
      ...answers,
      [questionId]: value,
    });

    if (eventLoggerRef.current) {
      eventLoggerRef.current.logEvent(
        "answer_changed",
        {
          questionId,
          answerLength: value.length,
        },
        false,
        questionId,
      );
    }
  };

  const handleViewLogs = () => {
    if (eventLoggerRef.current) {
      eventLoggerRef.current.sendBatch();
    }
    navigate("/logs");
  };

  const handleSubmit = () => {
    setShowSubmitModal(true);
  };

  const confirmSubmit = () => {
    // Flush any remaining events before submission
    if (eventLoggerRef.current) {
      eventLoggerRef.current.finalFlush();
    }
    dispatch(submitTestRequest(attemptId));
    setShowSubmitModal(false);
  };

  const cancelSubmit = () => {
    setShowSubmitModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="h-10 w-10 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Submit Test?
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to submit the test? This action cannot be
                undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={cancelSubmit}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSubmit}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {testSubmitted && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="h-10 w-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Test Submitted Successfully!
              </h3>
              <p className="text-gray-600">Redirecting to login page...</p>
            </div>
          </div>
        </div>
      )}

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="h-10 w-10 text-red-600"
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
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Violation Detected!
              </h3>
              <p className="text-gray-600 mb-4">{warningMessage}</p>
              <p className="text-sm text-red-600 font-medium">
                This violation has been recorded
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Secure Test Environment
              </h1>
              <p className="text-sm text-gray-600">Attempt ID: {attemptId}</p>
            </div>
            <div className="flex items-center gap-8">
              <button
                onClick={handleViewLogs}
                className="flex items-center gap-2 px-4 py-2 text-red-800 bg-gray-100 hover:bg-gray-200  rounded-lg transition-colors"
              >
                <svg
                  className="h-5 w-5 text-red-800"
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
                View Logs
              </button>
              <div className="flex items-center gap-3 bg-green-50 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  Violations
                </span>
                <span
                  className={`text-2xl font-bold ${violationCount > 0 ? "text-red-600" : "text-green-600"}`}
                >
                  {violationCount}
                </span>
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-gray-50 shadow-md rounded-lg mt-6">
        {/* Important Instructions */}
        <div className="card p-6 mb-6 border-l-4 border-orange-400 shadow-md bg-orange-50">
          <div className="flex items-start gap-3">
            <svg
              className="h-6 w-6 text-orange-500 flex-shrink-0 mt-0.5"
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
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Important Instructions
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Do not switch tabs or windows during the test</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Do not minimize or lose focus from this window</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Stay in fullscreen mode - exiting is a violation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>
                    Keyboard shortcuts (Ctrl+C, F12, etc.) are monitored
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Copy/paste and right-click are monitored</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>All activities are being logged for review</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Test Questions */}
        <div className="card p-8 bg-gray-100 shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Test Questions
          </h2>

          {/* Question 1 */}
          <div className="mb-8">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                Q1
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  What is the primary purpose of this secure test environment?
                </h3>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="q1"
                      value="monitor"
                      checked={answers.q1 === "monitor"}
                      onChange={(e) => handleAnswerChange("q1", e.target.value)}
                      className="mt-1"
                    />
                    <span className="text-gray-700">
                      To monitor and enforce test integrity
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="q1"
                      value="friendly"
                      checked={answers.q1 === "friendly"}
                      onChange={(e) => handleAnswerChange("q1", e.target.value)}
                      className="mt-1"
                    />
                    <span className="text-gray-700">
                      To provide a user-friendly interface
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="q1"
                      value="feedback"
                      checked={answers.q1 === "feedback"}
                      onChange={(e) => handleAnswerChange("q1", e.target.value)}
                      className="mt-1"
                    />
                    <span className="text-gray-700">
                      To collect user feedback
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="q1"
                      value="none"
                      checked={answers.q1 === "none"}
                      onChange={(e) => handleAnswerChange("q1", e.target.value)}
                      className="mt-1"
                    />
                    <span className="text-gray-700">None of the above</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Question 2 */}
          <div className="mb-8">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                Q2
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Which actions are considered violations in this test?
                </h3>
                <textarea
                  value={answers.q2}
                  onChange={(e) => handleAnswerChange("q2", e.target.value)}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Type your answer here..."
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base text-gray-600">
                  Total violations:{" "}
                  <span className="font-semibold text-red-600">
                    {violationCount}
                  </span>
                </p>
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading || testSubmitted}
                className="px-8 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {testSubmitted ? "Submitting..." : "Submit Test"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Test;
