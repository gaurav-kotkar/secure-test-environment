import { addEvent, loadFromStorage, batchSendRequest } from '../redux/slices/loggingSlice';

class EventLogger {
  constructor(store) {
    this.store = store;
    this.batchInterval = 15000; // 15 seconds
    this.intervalId = null;
    this.attemptId = null;
  }

  initialize(attemptId) {
    this.attemptId = attemptId;
    this.loadEventsFromStorage();
    this.startBatching();
  }

  loadEventsFromStorage() {
    if (!this.attemptId) return;
    
    try {
      const storedEvents = localStorage.getItem(`events_${this.attemptId}`);
      if (storedEvents) {
        const events = JSON.parse(storedEvents);
        this.store.dispatch(loadFromStorage(events));
      }
    } catch (error) {
      console.error('Failed to load events from storage:', error);
    }
  }

  logEvent(eventType, metadata = {}, isViolation = false, questionId = null) {
    if (!this.attemptId) {
      console.warn('Cannot log event: No active test attempt');
      return;
    }

    const event = {
      eventType,
      timestamp: Date.now(),
      metadata: {
        ...metadata,
        userAgent: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`
      },
      isViolation,
      questionId
    };

    // Add to Redux store
    this.store.dispatch(addEvent(event));

    // Persist to localStorage
    this.saveToStorage();

    return event;
  }

  saveToStorage() {
    if (!this.attemptId) return;

    try {
      const state = this.store.getState();
      const events = state.logging.eventQueue;
      localStorage.setItem(`events_${this.attemptId}`, JSON.stringify(events));
    } catch (error) {
      console.error('Failed to save events to storage:', error);
    }
  }

  startBatching() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(() => {
      this.sendBatch();
    }, this.batchInterval);
  }

  sendBatch() {
    if (!this.attemptId) return;

    const state = this.store.getState();
    const events = state.logging.eventQueue;

    if (events.length > 0) {
      this.store.dispatch(batchSendRequest(this.attemptId, events));
    }
  }

  stopBatching() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  finalFlush() {
    // Send remaining events before unmounting
    this.sendBatch();
    this.stopBatching();
  }

  cleanup() {
    this.stopBatching();
    if (this.attemptId) {
      localStorage.removeItem(`events_${this.attemptId}`);
    }
    this.attemptId = null;
  }
}

export default EventLogger;
