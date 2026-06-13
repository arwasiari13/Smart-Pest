import { Server } from 'http';
import { Server as SocketServer } from 'socket.io';
import { corsOrigins } from '../config/env';
import * as robotService from '../services/robot.service';
import * as iotService from '../services/iot.service';

let io: SocketServer | undefined;

export function initSocket(server: Server) {
  io = new SocketServer(server, {
    cors: { origin: corsOrigins },
  });

  io.on('connection', (socket) => {
    // ── App client rooms ──────────────────────────────────────────
    socket.on('join:user', (userId: string) => socket.join(`user:${userId}`));
    socket.on('join:territory', (territoryId: string) => socket.join(`territory:${territoryId}`));
    socket.on('join:robots', () => socket.join('robots'));

    // ── IoT car authentication ────────────────────────────────────
    socket.on('iot:auth', async (payload: { apiKey: string; robotSerial: string }, callback) => {
      try {
        const robot = await iotService.authenticateIotDevice(payload.apiKey, payload.robotSerial);
        if (!robot) {
          callback?.({ error: 'Unauthorized or robot not found' });
          return;
        }
        socket.data.robotId = robot.id;
        socket.join('iot:devices');
        // Mark robot online
        await robotService.updateRobotStatus(robot.id, { status: 'ACTIVE' });
        callback?.({ ok: true, robotId: robot.id });
      } catch {
        callback?.({ error: 'Authentication failed' });
      }
    });

    // ── IoT telemetry (GPS, battery, status) ─────────────────────
    socket.on('iot:telemetry', async (data: {
      batteryLevel?: number;
      currentLat?: number;
      currentLng?: number;
      status?: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'OFFLINE';
    }) => {
      if (!socket.data.robotId) return;
      try {
        await robotService.updateRobotStatus(socket.data.robotId, data);
      } catch {
        // ignore individual telemetry failures
      }
    });

    // ── IoT image + pest detection ────────────────────────────────
    socket.on('iot:image', async (data: {
      imageBase64?: string;
      imageUrl?: string;
      gpsLat: number;
      gpsLng: number;
      cameraId: string;
      detectedClass: string;
      confidence: number;
      metadata?: unknown;
    }, callback) => {
      if (!socket.data.robotId) {
        callback?.({ error: 'Not authenticated' });
        return;
      }
      try {
        const result = await iotService.processImageFromIot(socket.data.robotId, data);
        callback?.({ ok: true, imageId: result.image?.id, alertId: result.alert?.id ?? null });
      } catch (error) {
        callback?.({ error: error instanceof Error ? error.message : 'Processing failed' });
      }
    });

    // ── IoT disconnect → mark robot offline ───────────────────────
    socket.on('disconnect', async () => {
      if (socket.data.robotId) {
        try {
          await robotService.updateRobotStatus(socket.data.robotId, { status: 'OFFLINE' });
        } catch {
          // ignore
        }
      }
    });
  });

  return io;
}

export function getSocket() {
  return io;
}

export function emitToUser(userId: string, event: string, payload: unknown) {
  io?.to(`user:${userId}`).emit(event, payload);
}

export function emitToTerritory(territoryId: string, event: string, payload: unknown) {
  io?.to(`territory:${territoryId}`).emit(event, payload);
}

export function emitRobotUpdate(payload: unknown) {
  io?.to('robots').emit('robot:update', payload);
}
