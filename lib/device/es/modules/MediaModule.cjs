/*!
 * ***********************************
 * @ldesign/router v1.0.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:29 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
'use strict';

var EventEmitter = require('../core/EventEmitter.cjs');
var index = require('../utils/index.cjs');

class MediaModule extends EventEmitter.EventEmitter {
  constructor() {
    super();
    this.name = "media";
    this.permissionCheckers = /* @__PURE__ */ new Map();
    this.mediaInfo = this.getDefaultMediaInfo();
  }
  /**
   * 初始化模块
   */
  async init() {
    if (typeof window === "undefined") return;
    try {
      await this.detectMediaDevices();
      this.setupDeviceChangeListener();
      this.startPermissionMonitoring();
    } catch (error) {
      console.warn("Media devices detection failed:", error);
    }
  }
  /**
   * 销毁模块
   */
  async destroy() {
    this.removeDeviceChangeListener();
    this.stopPermissionMonitoring();
  }
  /**
   * 获取媒体设备信息
   */
  getData() {
    return {
      ...this.mediaInfo
    };
  }
  /**
   * 检查是否支持媒体设备 API
   */
  isSupported() {
    return index.safeNavigatorAccess((nav) => "mediaDevices" in nav && "enumerateDevices" in nav.mediaDevices, false);
  }
  /**
   * 获取摄像头列表
   */
  getCameras() {
    return [...this.mediaInfo.cameras];
  }
  /**
   * 获取麦克风列表
   */
  getMicrophones() {
    return [...this.mediaInfo.microphones];
  }
  /**
   * 获取扬声器列表
   */
  getSpeakers() {
    return [...this.mediaInfo.speakers];
  }
  /**
   * 检查是否有摄像头
   */
  hasCamera() {
    return this.mediaInfo.hasCamera;
  }
  /**
   * 检查是否有麦克风
   */
  hasMicrophone() {
    return this.mediaInfo.hasMicrophone;
  }
  /**
   * 检查是否有扬声器
   */
  hasSpeaker() {
    return this.mediaInfo.hasSpeaker;
  }
  /**
   * 请求摄像头权限
   */
  async requestCameraPermission() {
    if (!this.isSupported()) return false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true
      });
      stream.getTracks().forEach((track) => track.stop());
      this.mediaInfo.cameraPermission = "granted";
      this.emit("permissionChange", {
        type: "camera",
        state: "granted"
      });
      await this.detectMediaDevices();
      return true;
    } catch {
      this.mediaInfo.cameraPermission = "denied";
      this.emit("permissionChange", {
        type: "camera",
        state: "denied"
      });
      return false;
    }
  }
  /**
   * 请求麦克风权限
   */
  async requestMicrophonePermission() {
    if (!this.isSupported()) return false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });
      stream.getTracks().forEach((track) => track.stop());
      this.mediaInfo.microphonePermission = "granted";
      this.emit("permissionChange", {
        type: "microphone",
        state: "granted"
      });
      await this.detectMediaDevices();
      return true;
    } catch {
      this.mediaInfo.microphonePermission = "denied";
      this.emit("permissionChange", {
        type: "microphone",
        state: "denied"
      });
      return false;
    }
  }
  /**
   * 获取默认媒体信息
   */
  getDefaultMediaInfo() {
    return {
      supported: false,
      hasCamera: false,
      hasMicrophone: false,
      hasSpeaker: false,
      cameras: [],
      microphones: [],
      speakers: [],
      cameraPermission: "unknown",
      microphonePermission: "unknown"
    };
  }
  /**
   * 检测媒体设备
   */
  async detectMediaDevices() {
    if (!this.isSupported()) {
      this.mediaInfo.supported = false;
      return;
    }
    try {
      this.mediaInfo.supported = true;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = [];
      const microphones = [];
      const speakers = [];
      devices.forEach((device, index) => {
        const deviceItem = {
          deviceId: device.deviceId || `device-${index}`,
          label: device.label || `${device.kind} ${index + 1}`,
          kind: device.kind,
          groupId: device.groupId
        };
        switch (device.kind) {
          case "videoinput":
            cameras.push(deviceItem);
            break;
          case "audioinput":
            microphones.push(deviceItem);
            break;
          case "audiooutput":
            speakers.push(deviceItem);
            break;
        }
      });
      this.mediaInfo = {
        ...this.mediaInfo,
        hasCamera: cameras.length > 0,
        hasMicrophone: microphones.length > 0,
        hasSpeaker: speakers.length > 0,
        cameras,
        microphones,
        speakers
      };
      await this.checkPermissions();
      this.emit("deviceChange", this.mediaInfo);
    } catch (error) {
      console.warn("Failed to enumerate media devices:", error);
    }
  }
  /**
   * 检查权限状态
   */
  async checkPermissions() {
    if (!("permissions" in navigator)) return;
    try {
      const cameraPermission = await navigator.permissions.query({
        name: "camera"
      });
      this.mediaInfo.cameraPermission = cameraPermission.state;
      cameraPermission.addEventListener("change", () => {
        this.mediaInfo.cameraPermission = cameraPermission.state;
        this.emit("permissionChange", {
          type: "camera",
          state: cameraPermission.state
        });
      });
    } catch {
    }
    try {
      const microphonePermission = await navigator.permissions.query({
        name: "microphone"
      });
      this.mediaInfo.microphonePermission = microphonePermission.state;
      microphonePermission.addEventListener("change", () => {
        this.mediaInfo.microphonePermission = microphonePermission.state;
        this.emit("permissionChange", {
          type: "microphone",
          state: microphonePermission.state
        });
      });
    } catch {
    }
  }
  /**
   * 设置设备变化监听器
   */
  setupDeviceChangeListener() {
    if (!this.isSupported()) return;
    this.deviceChangeHandler = async () => {
      await this.detectMediaDevices();
    };
    navigator.mediaDevices.addEventListener("devicechange", this.deviceChangeHandler);
  }
  /**
   * 移除设备变化监听器
   */
  removeDeviceChangeListener() {
    if (!this.isSupported() || !this.deviceChangeHandler) return;
    navigator.mediaDevices.removeEventListener("devicechange", this.deviceChangeHandler);
    this.deviceChangeHandler = void 0;
  }
  /**
   * 开始权限状态监控
   */
  startPermissionMonitoring() {
    const checker = setInterval(async () => {
      await this.checkPermissions();
    }, 5e3);
    this.permissionCheckers.set("main", checker);
  }
  /**
   * 停止权限状态监控
   */
  stopPermissionMonitoring() {
    this.permissionCheckers.forEach((checker) => clearInterval(checker));
    this.permissionCheckers.clear();
  }
  /**
   * 测试摄像头
   */
  async testCamera(constraints) {
    if (!this.isSupported()) return false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: constraints || true
      });
      const videoTracks = stream.getVideoTracks();
      const success = videoTracks.length > 0;
      stream.getTracks().forEach((track) => track.stop());
      return success;
    } catch (error) {
      console.warn("Camera test failed:", error);
      return false;
    }
  }
  /**
   * 测试麦克风
   */
  async testMicrophone(constraints) {
    if (!this.isSupported()) return false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: constraints || true
      });
      const audioTracks = stream.getAudioTracks();
      const success = audioTracks.length > 0;
      stream.getTracks().forEach((track) => track.stop());
      return success;
    } catch (error) {
      console.warn("Microphone test failed:", error);
      return false;
    }
  }
  /**
   * 获取媒体流
   */
  async getMediaStream(constraints) {
    if (!this.isSupported()) return null;
    try {
      return await navigator.mediaDevices.getUserMedia(constraints || {
        video: true,
        audio: true
      });
    } catch (error) {
      console.warn("Failed to get media stream:", error);
      return null;
    }
  }
  /**
   * 获取屏幕共享流
   */
  async getDisplayMedia(constraints) {
    if (!this.isSupported()) return null;
    if (!("getDisplayMedia" in navigator.mediaDevices)) {
      console.warn("Screen capture is not supported");
      return null;
    }
    try {
      return await navigator.mediaDevices.getDisplayMedia(constraints || {
        video: true,
        audio: false
      });
    } catch (error) {
      console.warn("Failed to get display media:", error);
      return null;
    }
  }
}
/*! End of @ldesign/device | Powered by @ldesign/builder */

exports.MediaModule = MediaModule;
/*! End of @ldesign/router | Powered by @ldesign/builder */
//# sourceMappingURL=MediaModule.cjs.map
