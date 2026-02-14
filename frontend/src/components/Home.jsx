import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { startTestRequest } from '../redux/slices/testSlice';

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.test);

  const handleStartTest = () => {
    dispatch(startTestRequest());
    // Navigate to test page after a short delay to ensure state is updated
    setTimeout(() => {
      navigate('/test');
    }, 500);
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">Secure Test Environment</h1>
          <div className="flex items-center gap-8">
            <span className="text-base text-gray-700">Welcome, {user?.name}</span>
            <button
              onClick={handleLogout}
              className="text-base text-red-600 hover:text-red-700 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center mb-6">
          <div className="mx-auto h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center mb-3.5">
            <svg className="h-14 w-14 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Secure Test Environment</h2>
          <p className="text-lg text-gray-600">Please enter your information to begin the assessment</p>
        </div>

        <div className="card p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Before You Start</h3>
              
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>This is a monitored test environment</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>All activities will be logged and reviewed</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Violations will be recorded and may affect your assessment</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Keep this window in focus throughout the test</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 text-center border-t border-gray-200">
            <button
              onClick={handleStartTest}
              disabled={loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-lg py-1.5 px-10"
            >
              {loading ? 'Starting Test...' : 'Start Assessment'}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>By starting this test, you acknowledge that you have read and understood the guidelines above.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
