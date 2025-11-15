import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

function App() {
  const [requests, setRequests] = useState([]);
  const [providers, setProviders] = useState([]);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    // Connect to Socket.io
    const socket = io(BACKEND_URL);

    socket.on('connect', () => {
      console.log('✓ Connected to MedConnect backend');
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('✗ Disconnected from backend');
      setConnected(false);
    });

    socket.on('initialData', (data) => {
      console.log('Received initial data:', data);
      setRequests(data.requests || []);
      setProviders(data.providers || []);
      setLastUpdate(new Date());
    });

    socket.on('newRequest', (request) => {
      console.log('New request received:', request);
      setRequests(prev => [request, ...prev]);
      setLastUpdate(new Date());
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  // Get urgency color
  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-100 border-red-500 text-red-900';
      case 'high':
        return 'bg-red-50 border-red-400 text-red-800';
      case 'medium':
        return 'bg-yellow-50 border-yellow-400 text-yellow-800';
      default:
        return 'bg-green-50 border-green-400 text-green-800';
    }
  };

  // Get urgency badge color
  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-600 text-white';
      case 'high':
        return 'bg-red-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-green-500 text-white';
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-600 text-white';
      case 'En Route':
        return 'bg-blue-600 text-white';
      case 'Dispatched':
        return 'bg-purple-600 text-white';
      case 'Confirmed':
        return 'bg-yellow-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Format relative time
  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 min ago';
    if (diffMins < 60) return `${diffMins} mins ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    return `${diffHours} hours ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 text-white p-3 rounded-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">MedConnect</h1>
                <p className="text-sm text-gray-600">Emergency Medical Dispatch System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">System Status</div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className={`text-sm font-semibold ${connected ? 'text-green-700' : 'text-red-700'}`}>
                    {connected ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total Requests</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{requests.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Active Providers</div>
            <div className="mt-2 text-3xl font-bold text-green-600">
              {providers.filter(p => p.status === 'Available').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Critical</div>
            <div className="mt-2 text-3xl font-bold text-red-600">
              {requests.filter(r => r.urgency === 'critical').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Last Update</div>
            <div className="mt-2 text-lg font-semibold text-gray-700">
              {formatTime(lastUpdate)}
            </div>
          </div>
        </div>

        {/* Provider Status */}
        <div className="bg-white rounded-lg shadow-lg mb-8 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Provider Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {providers.map((provider, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-2 ${
                  provider.status === 'Available'
                    ? 'bg-green-50 border-green-500'
                    : 'bg-gray-50 border-gray-300'
                }`}
              >
                <div className="font-semibold text-gray-900">{provider.name}</div>
                <div className="text-sm text-gray-600">{provider.eta}</div>
                <div
                  className={`mt-2 inline-block px-2 py-1 rounded text-xs font-semibold ${
                    provider.status === 'Available'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-600 text-white'
                  }`}
                >
                  {provider.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Requests List */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Live Dispatch Board</h2>
            <div className="text-sm text-gray-500">
              Auto-refresh • {requests.length} requests
            </div>
          </div>

          {requests.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-gray-600">No requests yet. System ready to receive SMS.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className={`border-l-4 rounded-lg p-5 transition-all hover:shadow-md ${getUrgencyColor(
                    request.urgency
                  )}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-lg font-bold text-gray-900">{request.id}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getUrgencyBadge(request.urgency)}`}>
                          {request.urgency.toUpperCase()}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <div className="text-sm font-semibold text-gray-700">Request Type</div>
                          <div className="text-lg font-bold text-gray-900">
                            {request.type}: {request.item}
                          </div>
                          <div className="text-sm text-gray-600">Quantity: {request.quantity}</div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-700">Assignment</div>
                          <div className="text-lg font-bold text-blue-700">{request.provider}</div>
                          <div className="text-sm text-gray-600">ETA: {request.eta}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{formatTime(request.timestamp)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span>{request.phoneNumber}</span>
                        </div>
                        <div className="text-gray-500">• {getRelativeTime(request.timestamp)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            MedConnect Emergency Dispatch • SMS: {providers.length > 0 ? 'Active' : 'Configuring'}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Send SMS: <span className="font-mono">BLOOD O-NEG 2</span> or{' '}
            <span className="font-mono">MEDICINE INSULIN 10</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
