import * as THREE from 'three';
import { gsap } from 'gsap';
import { AudioData, AnimationEffect, AnimationConfig } from '../types';
import { MarblePhysics } from './MarblePhysics';

export class AnimationEngine {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private canvas: HTMLCanvasElement;
  private animationId: number | null = null;
  private effects: Map<string, THREE.Object3D> = new Map();
  private audioData: AudioData | null = null;
  private config: AnimationConfig;
  private marblePhysics: MarblePhysics | null = null;
  private lastTime: number = 0;

  constructor(canvas: HTMLCanvasElement, config: AnimationConfig) {
    this.canvas = canvas;
    this.config = config;
    
    this.initThreeJS();
    this.setupScene();
    this.setupCamera();
    this.setupRenderer();
    this.setupLighting();
    this.setupMarblePhysics();
  }

  private initThreeJS(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.config.backgroundColor);
  }

  private setupScene(): void {
    // 添加環境光
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    // 添加方向光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    this.scene.add(directionalLight);
  }

  private setupCamera(): void {
    const aspect = this.config.resolution.width / this.config.resolution.height;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.position.z = 5;
  }

  private setupRenderer(): void {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true
    });
    
    this.renderer.setSize(this.config.resolution.width, this.config.resolution.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  private setupLighting(): void {
    // 添加點光源用於動態效果
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(0, 0, 10);
    this.scene.add(pointLight);
  }

  private setupMarblePhysics(): void {
    this.marblePhysics = new MarblePhysics(this.scene);
  }

  updateAudioData(audioData: AudioData): void {
    this.audioData = audioData;
    this.updateEffects();
    
    // Update marble physics with audio data
    if (this.marblePhysics) {
      this.marblePhysics.spawnMarbleFromAudio({
        volume: audioData.volume,
        bassLevel: audioData.bassLevel
      });
    }
  }

  private updateEffects(): void {
    if (!this.audioData) return;

    this.effects.forEach((effect, id) => {
      this.updateEffect(effect, id);
    });
  }

  private updateEffect(effect: THREE.Object3D, id: string): void {
    if (!this.audioData) return;

    const { bassLevel, midLevel, trebleLevel, volume, beat } = this.audioData;

    switch (id) {
      case 'wave':
        this.updateWaveEffect(effect, bassLevel, midLevel);
        break;
      case 'particle':
        this.updateParticleEffect(effect, volume, beat);
        break;
      case 'geometric':
        this.updateGeometricEffect(effect, trebleLevel, beat);
        break;
      case 'fluid':
        this.updateFluidEffect(effect, midLevel, volume);
        break;
      case 'neural':
        this.updateNeuralEffect(effect, bassLevel, trebleLevel);
        break;
    }
  }

  private updateWaveEffect(effect: THREE.Object3D, bassLevel: number, _midLevel: number): void {
    if (effect instanceof THREE.Mesh) {
      const geometry = effect.geometry as THREE.PlaneGeometry;
      const positions = geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const z = positions[i + 2];
        
        // 根據音頻數據調整頂點位置
        const waveHeight = Math.sin(x * 0.1 + Date.now() * 0.001) * bassLevel * 2;
        positions[i + 2] = z + waveHeight;
      }
      
      geometry.attributes.position.needsUpdate = true;
      geometry.computeVertexNormals();
    }
  }

  private updateParticleEffect(effect: THREE.Object3D, volume: number, beat: boolean): void {
    if (effect instanceof THREE.Points) {
      const positions = effect.geometry.attributes.position.array as Float32Array;
      const colors = effect.geometry.attributes.color.array as Float32Array;
      
      for (let i = 0; i < positions.length; i += 3) {
        // 根據音量調整粒子位置
        const intensity = volume * 10;
        positions[i + 1] += (Math.random() - 0.5) * intensity * 0.1;
        
        // 根據節拍改變顏色
        if (beat) {
          colors[i] = Math.random();     // R
          colors[i + 1] = Math.random(); // G
          colors[i + 2] = Math.random(); // B
        }
      }
      
      effect.geometry.attributes.position.needsUpdate = true;
      effect.geometry.attributes.color.needsUpdate = true;
    }
  }

  private updateGeometricEffect(effect: THREE.Object3D, trebleLevel: number, beat: boolean): void {
    if (effect instanceof THREE.Mesh) {
      // 根據高頻調整旋轉
      effect.rotation.x += trebleLevel * 0.1;
      effect.rotation.y += trebleLevel * 0.05;
      
      // 根據節拍調整縮放
      if (beat) {
        gsap.to(effect.scale, {
          x: 1.2,
          y: 1.2,
          z: 1.2,
          duration: 0.1,
          ease: "power2.out"
        });
        
        gsap.to(effect.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    }
  }

  private updateFluidEffect(effect: THREE.Object3D, midLevel: number, volume: number): void {
    if (effect instanceof THREE.Mesh) {
      const material = effect.material as THREE.ShaderMaterial;
      if (material.uniforms) {
        material.uniforms.time.value = Date.now() * 0.001;
        material.uniforms.intensity.value = midLevel;
        material.uniforms.volume.value = volume;
      }
    }
  }

  private updateNeuralEffect(effect: THREE.Object3D, bassLevel: number, trebleLevel: number): void {
    if (effect instanceof THREE.Mesh) {
      // 創建神經網絡般的連接效果
      const geometry = effect.geometry as THREE.BufferGeometry;
      const positions = geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < positions.length; i += 3) {
        const nodeIndex = Math.floor(i / 3);
        const frequency = bassLevel + trebleLevel;
        
        // 根據頻率調整節點位置
        positions[i + 2] = Math.sin(nodeIndex * 0.1 + Date.now() * 0.001) * frequency;
      }
      
      geometry.attributes.position.needsUpdate = true;
    }
  }

  addEffect(effect: AnimationEffect): void {
    let threeEffect: THREE.Object3D;

    switch (effect.type) {
      case 'marble':
        // 玻璃珠效果不需要創建額外的3D對象，因為它由MarblePhysics管理
        return;
      case 'wave':
        threeEffect = this.createWaveEffect(effect);
        break;
      case 'particle':
        threeEffect = this.createParticleEffect(effect);
        break;
      case 'geometric':
        threeEffect = this.createGeometricEffect(effect);
        break;
      case 'fluid':
        threeEffect = this.createFluidEffect(effect);
        break;
      case 'neural':
        threeEffect = this.createNeuralEffect(effect);
        break;
      default:
        return;
    }

    this.effects.set(effect.id, threeEffect);
    this.scene.add(threeEffect);
  }

  private createWaveEffect(effect: AnimationEffect): THREE.Object3D {
    const geometry = new THREE.PlaneGeometry(10, 10, 50, 50);
    const material = new THREE.MeshLambertMaterial({
      color: effect.color,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });
    
    return new THREE.Mesh(geometry, material);
  }

  private createParticleEffect(effect: AnimationEffect): THREE.Object3D {
    const particleCount = effect.size * 1000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      
      colors[i * 3] = Math.random();
      colors[i * 3 + 1] = Math.random();
      colors[i * 3 + 2] = Math.random();
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });
    
    return new THREE.Points(geometry, material);
  }

  private createGeometricEffect(effect: AnimationEffect): THREE.Object3D {
    const geometry = new THREE.IcosahedronGeometry(effect.size, 0);
    const material = new THREE.MeshPhongMaterial({
      color: effect.color,
      shininess: 100,
      transparent: true,
      opacity: 0.9
    });
    
    return new THREE.Mesh(geometry, material);
  }

  private createFluidEffect(effect: AnimationEffect): THREE.Object3D {
    const geometry = new THREE.SphereGeometry(effect.size, 32, 32);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        intensity: { value: 0 },
        volume: { value: 0 },
        color: { value: new THREE.Color(effect.color) }
      },
      vertexShader: `
        uniform float time;
        uniform float intensity;
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        void main() {
          vPosition = position;
          vNormal = normal;
          
          vec3 pos = position;
          pos.z += sin(pos.x * 2.0 + time) * intensity * 0.5;
          pos.z += cos(pos.y * 2.0 + time) * intensity * 0.3;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float volume;
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        void main() {
          float intensity = volume * 2.0;
          vec3 finalColor = color * intensity;
          gl_FragColor = vec4(finalColor, 0.8);
        }
      `,
      transparent: true
    });
    
    return new THREE.Mesh(geometry, material);
  }

  private createNeuralEffect(effect: AnimationEffect): THREE.Object3D {
    const geometry = new THREE.BufferGeometry();
    const nodeCount = 50;
    const positions = new Float32Array(nodeCount * 3);
    
    for (let i = 0; i < nodeCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
      color: effect.color,
      size: 0.2,
      transparent: true,
      opacity: 0.8
    });
    
    return new THREE.Points(geometry, material);
  }

  removeEffect(id: string): void {
    const effect = this.effects.get(id);
    if (effect) {
      this.scene.remove(effect);
      this.effects.delete(id);
    }
    
    // 如果是玻璃珠效果，清除所有玻璃珠
    const effectConfig = this.config.effects.find(e => e.id === id);
    if (effectConfig?.type === 'marble' && this.marblePhysics) {
      this.marblePhysics.clearMarbles();
    }
  }

  start(): void {
    this.lastTime = performance.now();
    const animate = (currentTime: number) => {
      this.animationId = requestAnimationFrame(animate);
      
      const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
      this.lastTime = currentTime;
      
      // Update marble physics
      if (this.marblePhysics && this.audioData) {
        this.marblePhysics.update(deltaTime, {
          frequencyData: this.audioData.frequencyData,
          volume: this.audioData.volume
        });
      }
      
      this.render();
    };
    animate(this.lastTime);
  }

  stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  resize(width: number, height: number): void {
    this.config.resolution.width = width;
    this.config.resolution.height = height;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(width, height);
  }

  dispose(): void {
    this.stop();
    
    if (this.marblePhysics) {
      this.marblePhysics.dispose();
    }
    
    this.effects.forEach(effect => {
      this.scene.remove(effect);
      if (effect instanceof THREE.Mesh) {
        effect.geometry.dispose();
        if (Array.isArray(effect.material)) {
          effect.material.forEach(material => material.dispose());
        } else {
          effect.material.dispose();
        }
      }
    });
    
    this.effects.clear();
    this.renderer.dispose();
  }
}
