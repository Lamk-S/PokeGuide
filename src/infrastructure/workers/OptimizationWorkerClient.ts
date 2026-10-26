import type {
  OptimizationWorkerRequest,
  OptimizationWorkerResponse,
  SpeedOptimizationPayload,
  SurvivalOptimizationPayload,
  DamageOptimizationPayload,
  SpeedOptimizationResult,
  SurvivalOptimizationResult,
  DamageOptimizationResult,
  OptimizationType,
} from "./optimization.types";

type PendingCallback = {
  resolve: (value: unknown) => void;
  reject: (reason: Error) => void;
  type: OptimizationType;
  timestamp: number;
};

function generateId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export class OptimizationWorkerClient {
  private static instance: OptimizationWorkerClient | null = null;
  private worker: Worker | null = null;
  private pendingCallbacks: Map<string, PendingCallback> = new Map();
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): OptimizationWorkerClient {
    if (!OptimizationWorkerClient.instance) {
      OptimizationWorkerClient.instance = new OptimizationWorkerClient();
    }
    return OptimizationWorkerClient.instance;
  }

  private ensureWorker(): Worker {
    if (typeof window === "undefined") {
      throw new Error(
        "WORKER_NOT_AVAILABLE_IN_SSR: OptimizationWorkerClient solo puede usarse en el navegador",
      );
    }

    if (typeof Worker === "undefined") {
      throw new Error(
        "WORKER_API_NOT_SUPPORTED: Web Workers no soportados en este entorno",
      );
    }

    if (this.worker && this.isInitialized) {
      return this.worker;
    }

    try {
      this.worker = new Worker(
        new URL("./optimization.worker.ts", import.meta.url),
      );
      this.isInitialized = true;

      this.worker.addEventListener("message", this.handleMessage);
      this.worker.addEventListener("error", this.handleWorkerError);

      return this.worker;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`WORKER_INIT_FAILED: ${message}`);
    }
  }

  private handleMessage = (
    event: MessageEvent<OptimizationWorkerResponse>,
  ): void => {
    const response = event.data;
    const callback = this.pendingCallbacks.get(response.id);

    if (!callback) {
      return;
    }

    this.pendingCallbacks.delete(response.id);

    if (response.status === "SUCCESS") {
      callback.resolve(response.data);
    } else {
      callback.reject(new Error(response.error));
    }
  };

  private handleWorkerError = (event: ErrorEvent): void => {
    const error = new Error(`WORKER_RUNTIME_ERROR: ${event.message}`);
    for (const [, callback] of this.pendingCallbacks) {
      callback.reject(error);
    }
    this.pendingCallbacks.clear();
    this.terminate();
  };

  private postRequest<T>(request: OptimizationWorkerRequest): Promise<T> {
    const worker = this.ensureWorker();

    return new Promise<T>((resolve, reject) => {
      this.pendingCallbacks.set(request.id, {
        resolve: resolve as (value: unknown) => void,
        reject,
        type: request.type,
        timestamp: Date.now(),
      });

      try {
        worker.postMessage(request);
      } catch (error) {
        this.pendingCallbacks.delete(request.id);
        const message = error instanceof Error ? error.message : String(error);
        reject(new Error(`WORKER_POST_MESSAGE_FAILED: ${message}`));
      }

      setTimeout(() => {
        if (this.pendingCallbacks.has(request.id)) {
          this.pendingCallbacks.delete(request.id);
          reject(
            new Error(`WORKER_TIMEOUT [${request.type}]: id=${request.id}`),
          );
        }
      }, 30000);
    });
  }

  public async optimizeSpeed(
    payload: SpeedOptimizationPayload,
  ): Promise<SpeedOptimizationResult> {
    const request: OptimizationWorkerRequest = {
      id: generateId(),
      type: "SPEED",
      payload,
    };

    return this.postRequest<SpeedOptimizationResult>(request);
  }

  public async optimizeSurvival(
    payload: SurvivalOptimizationPayload,
  ): Promise<SurvivalOptimizationResult> {
    const request: OptimizationWorkerRequest = {
      id: generateId(),
      type: "SURVIVAL",
      payload,
    };

    return this.postRequest<SurvivalOptimizationResult>(request);
  }

  public async optimizeDamage(
    payload: DamageOptimizationPayload,
  ): Promise<DamageOptimizationResult> {
    const request: OptimizationWorkerRequest = {
      id: generateId(),
      type: "DAMAGE",
      payload,
    };

    return this.postRequest<DamageOptimizationResult>(request);
  }

  public terminate(): void {
    if (this.worker) {
      this.worker.removeEventListener("message", this.handleMessage);
      this.worker.removeEventListener("error", this.handleWorkerError);
      this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
    this.pendingCallbacks.clear();
  }

  public getPendingCount(): number {
    return this.pendingCallbacks.size;
  }

  public static resetInstance(): void {
    if (OptimizationWorkerClient.instance) {
      OptimizationWorkerClient.instance.terminate();
      OptimizationWorkerClient.instance = null;
    }
  }
}

export const optimizationWorkerClient = OptimizationWorkerClient.getInstance();
