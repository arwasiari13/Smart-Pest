/**
 * carWifi.ts – Direct WiFi connection between the mobile app and the robot car.
 *
 * Architecture:
 *   The robot car runs a WebSocket server on port 8765 on the local WiFi network.
 *   The mobile app connects directly to ws://<car-ip>:8765 when both are on the same WiFi.
 *   This gives zero-latency telemetry and control without going through the cloud backend.
 *
 * Car ←→ App message protocol (JSON):
 *   Car → App:  { type: 'telemetry', data: { lat, lng, battery, status, timestamp } }
 *   Car → App:  { type: 'detection', data: { detectedClass, confidence, imageUrl, lat, lng } }
 *   Car → App:  { type: 'status',    data: { connected: true, robotId, serialNumber, firmwareVersion } }
 *   App → Car:  { type: 'command',   data: { action: 'start' | 'stop' | 'pause' | 'return_home' } }
 *   App → Car:  { type: 'ping' }
 */

export type CarTelemetry = {
  lat: number;
  lng: number;
  battery: number;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'OFFLINE';
  timestamp: string;
};

export type CarDetection = {
  detectedClass: string;
  confidence: number;
  imageUrl?: string;
  lat: number;
  lng: number;
};

export type CarStatus = {
  connected: boolean;
  robotId?: string;
  serialNumber?: string;
  firmwareVersion?: string;
};

export type CarMessage =
  | { type: 'telemetry'; data: CarTelemetry }
  | { type: 'detection'; data: CarDetection }
  | { type: 'status'; data: CarStatus }
  | { type: 'pong' };

export type CarCommand =
  | { type: 'command'; data: { action: 'start' | 'stop' | 'pause' | 'return_home' } }
  | { type: 'ping' };

export type CarConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

export type CarWifiCallbacks = {
  onStateChange?: (state: CarConnectionState) => void;
  onTelemetry?: (data: CarTelemetry) => void;
  onDetection?: (data: CarDetection) => void;
  onCarStatus?: (data: CarStatus) => void;
  onError?: (error: string) => void;
};

const CAR_PORT = 8765;
const RECONNECT_DELAY_MS = 3000;
const PING_INTERVAL_MS = 5000;

export class CarWifiConnection {
  private ws: WebSocket | null = null;
  private carIp: string = '';
  private state: CarConnectionState = 'disconnected';
  private callbacks: CarWifiCallbacks = {};
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private autoReconnect: boolean = false;

  setCallbacks(callbacks: CarWifiCallbacks) {
    this.callbacks = callbacks;
  }

  private setState(state: CarConnectionState) {
    this.state = state;
    this.callbacks.onStateChange?.(state);
  }

  // Connect to the robot car at the given IP address (same WiFi network)
  connect(carIp: string, autoReconnect = true) {
    this.carIp = carIp;
    this.autoReconnect = autoReconnect;
    this.openSocket();
  }

  private openSocket() {
    this.setState('connecting');
    const url = `ws://${this.carIp}:${CAR_PORT}`;

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.setState('connected');
        this.startPing();
      };

      this.ws.onmessage = (event) => {
        try {
          const msg: CarMessage = JSON.parse(event.data);
          this.handleMessage(msg);
        } catch {
          // ignore malformed frames
        }
      };

      this.ws.onerror = () => {
        this.setState('error');
        this.callbacks.onError?.(`Cannot reach car at ${this.carIp}:${CAR_PORT}`);
      };

      this.ws.onclose = () => {
        this.stopPing();
        if (this.state !== 'disconnected') {
          this.setState('disconnected');
          if (this.autoReconnect) {
            this.reconnectTimeout = setTimeout(() => this.openSocket(), RECONNECT_DELAY_MS);
          }
        }
      };
    } catch (err) {
      this.setState('error');
      this.callbacks.onError?.(String(err));
    }
  }

  private handleMessage(msg: CarMessage) {
    switch (msg.type) {
      case 'telemetry':
        this.callbacks.onTelemetry?.(msg.data);
        break;
      case 'detection':
        this.callbacks.onDetection?.(msg.data);
        break;
      case 'status':
        this.callbacks.onCarStatus?.(msg.data);
        break;
      case 'pong':
        // heartbeat received – connection is healthy
        break;
    }
  }

  sendCommand(action: 'start' | 'stop' | 'pause' | 'return_home') {
    this.send({ type: 'command', data: { action } });
  }

  private send(msg: CarCommand) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  private startPing() {
    this.pingInterval = setInterval(() => this.send({ type: 'ping' }), PING_INTERVAL_MS);
  }

  private stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  disconnect() {
    this.autoReconnect = false;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.stopPing();
    this.ws?.close();
    this.ws = null;
    this.setState('disconnected');
  }

  getState(): CarConnectionState {
    return this.state;
  }

  getCarIp(): string {
    return this.carIp;
  }
}

// Singleton instance – import and use this everywhere in the app
export const carWifi = new CarWifiConnection();
