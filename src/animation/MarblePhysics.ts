import * as THREE from 'three';
import { XylophoneSynth } from '../audio/XylophoneSynth';

export interface MarbleState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  acceleration: THREE.Vector3;
  radius: number;
  mass: number;
  bounceCount: number;
  isActive: boolean;
}

export interface XylophoneKey {
  position: THREE.Vector3;
  width: number;
  height: number;
  depth: number;
  note: string;
  frequency: number;
  color: THREE.Color;
  isHit: boolean;
  hitTime: number;
}

export class MarblePhysics {
  private marbles: MarbleState[] = [];
  private keys: XylophoneKey[] = [];
  private gravity: THREE.Vector3;
  private friction: number;
  private bounceDamping: number;
  private scene: THREE.Scene;
  private marbleMeshes: THREE.Mesh[] = [];
  private keyMeshes: THREE.Mesh[] = [];
  private trailPoints: THREE.Vector3[] = [];
  private trailGeometry!: THREE.BufferGeometry;
  private trailMaterial!: THREE.LineBasicMaterial;
  private trailLine!: THREE.Line;
  private xylophoneSynth: XylophoneSynth;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.gravity = new THREE.Vector3(0, -9.8, 0);
    this.friction = 0.98;
    this.bounceDamping = 0.7;
    this.xylophoneSynth = new XylophoneSynth();
    
    this.setupXylophoneKeys();
    this.setupTrail();
  }

  private setupXylophoneKeys(): void {
    const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const frequencies = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88];
    const colors = [
      new THREE.Color(0xff6b6b), // C - Red
      new THREE.Color(0xffa726), // D - Orange
      new THREE.Color(0xffeb3b), // E - Yellow
      new THREE.Color(0x4caf50), // F - Green
      new THREE.Color(0x2196f3), // G - Blue
      new THREE.Color(0x9c27b0), // A - Purple
      new THREE.Color(0xe91e63), // B - Pink
    ];

    for (let i = 0; i < notes.length; i++) {
      const key: XylophoneKey = {
        position: new THREE.Vector3(i * 2 - 6, 0, 0),
        width: 1.5,
        height: 0.3,
        depth: 0.8,
        note: notes[i],
        frequency: frequencies[i],
        color: colors[i],
        isHit: false,
        hitTime: 0
      };
      
      this.keys.push(key);
      this.createKeyMesh(key);
    }
  }

  private createKeyMesh(key: XylophoneKey): void {
    const geometry = new THREE.BoxGeometry(key.width, key.height, key.depth);
    const material = new THREE.MeshPhongMaterial({
      color: key.color,
      shininess: 100,
      transparent: false,
      opacity: 1.0
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(key.position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    this.scene.add(mesh);
    this.keyMeshes.push(mesh);
    
    console.log(`Created xylophone key: ${key.note} at position`, key.position);
  }

  private setupTrail(): void {
    this.trailGeometry = new THREE.BufferGeometry();
    this.trailMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
      linewidth: 2
    });
    
    this.trailLine = new THREE.Line(this.trailGeometry, this.trailMaterial);
    this.scene.add(this.trailLine);
  }

  createMarble(startHeight: number = 10): void {
    const marble: MarbleState = {
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 2, // Random X position
        startHeight,
        0
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 2, // Random horizontal velocity
        0,
        0
      ),
      acceleration: new THREE.Vector3(0, 0, 0),
      radius: 0.3,
      mass: 1,
      bounceCount: 0,
      isActive: true
    };

    this.marbles.push(marble);
    this.createMarbleMesh(marble);
  }

  private createMarbleMesh(marble: MarbleState): void {
    const geometry = new THREE.SphereGeometry(marble.radius, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: false,
      opacity: 1.0,
      shininess: 1000,
      reflectivity: 1
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(marble.position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    this.scene.add(mesh);
    this.marbleMeshes.push(mesh);
    
    console.log(`Created marble at position`, marble.position);
  }

  update(deltaTime: number, audioData?: { frequencyData: Float32Array; volume: number }): void {
    // Update marble physics
    for (let i = this.marbles.length - 1; i >= 0; i--) {
      const marble = this.marbles[i];
      if (!marble.isActive) continue;

      // Apply gravity
      marble.acceleration.copy(this.gravity);
      
      // Apply audio influence
      if (audioData) {
        this.applyAudioInfluence(marble, audioData);
      }

      // Update velocity and position
      marble.velocity.add(marble.acceleration.clone().multiplyScalar(deltaTime));
      marble.velocity.multiplyScalar(this.friction);
      marble.position.add(marble.velocity.clone().multiplyScalar(deltaTime));

      // Check collisions with keys
      this.checkKeyCollisions(marble);

      // Update marble mesh
      if (this.marbleMeshes[i]) {
        this.marbleMeshes[i].position.copy(marble.position);
        
        // Add rotation based on velocity
        this.marbleMeshes[i].rotation.x += marble.velocity.y * deltaTime * 0.5;
        this.marbleMeshes[i].rotation.z += marble.velocity.x * deltaTime * 0.5;
      }

      // Add to trail
      this.trailPoints.push(marble.position.clone());
      if (this.trailPoints.length > 100) {
        this.trailPoints.shift();
      }

      // Remove marble if it falls too low
      if (marble.position.y < -10) {
        marble.isActive = false;
        this.scene.remove(this.marbleMeshes[i]);
        this.marbleMeshes.splice(i, 1);
        this.marbles.splice(i, 1);
      }
    }

    // Update trail
    this.updateTrail();

    // Update key animations
    this.updateKeyAnimations(deltaTime);
    
    // Debug: log marble positions
    if (this.marbles.length > 0) {
      console.log(`Marble position: ${this.marbles[0].position.x.toFixed(2)}, ${this.marbles[0].position.y.toFixed(2)}, ${this.marbles[0].position.z.toFixed(2)}`);
    }
  }

  private applyAudioInfluence(marble: MarbleState, audioData: { frequencyData: Float32Array; volume: number }): void {
    // Map frequency data to marble behavior
    const bassLevel = this.getFrequencyLevel(audioData.frequencyData, 0, 10);
    const midLevel = this.getFrequencyLevel(audioData.frequencyData, 10, 50);
    const trebleLevel = this.getFrequencyLevel(audioData.frequencyData, 50, 100);

    // Bass affects horizontal movement
    marble.velocity.x += (Math.random() - 0.5) * bassLevel * 0.1;
    
    // Mid affects vertical bounce
    if (midLevel > 0.3) {
      marble.velocity.y += midLevel * 0.5;
    }
    
    // Treble affects rotation
    marble.velocity.z += (Math.random() - 0.5) * trebleLevel * 0.05;
  }

  private getFrequencyLevel(frequencyData: Float32Array, startPercent: number, endPercent: number): number {
    const length = frequencyData.length;
    const startIndex = Math.floor((startPercent / 100) * length);
    const endIndex = Math.floor((endPercent / 100) * length);
    
    let sum = 0;
    for (let i = startIndex; i < endIndex; i++) {
      sum += Math.abs(frequencyData[i]);
    }
    
    return sum / (endIndex - startIndex);
  }

  private checkKeyCollisions(marble: MarbleState): void {
    for (let i = 0; i < this.keys.length; i++) {
      const key = this.keys[i];
      
      // Simple AABB collision detection
      if (
        marble.position.x >= key.position.x - key.width / 2 &&
        marble.position.x <= key.position.x + key.width / 2 &&
        marble.position.y <= key.position.y + key.height / 2 + marble.radius &&
        marble.position.y >= key.position.y - key.height / 2 - marble.radius
      ) {
        // Collision detected
        this.handleKeyCollision(marble, key, i);
      }
    }
  }

  private handleKeyCollision(marble: MarbleState, key: XylophoneKey, keyIndex: number): void {
    // Bounce the marble
    marble.velocity.y = Math.abs(marble.velocity.y) * this.bounceDamping;
    marble.position.y = key.position.y + key.height / 2 + marble.radius;
    
    // Add some randomness to horizontal movement
    marble.velocity.x += (Math.random() - 0.5) * 2;
    
    // Mark key as hit
    key.isHit = true;
    key.hitTime = Date.now();
    
    // Create visual effect
    this.createHitEffect(key.position, key.color);
    
    // Play note (this would trigger audio in a real implementation)
    this.playNote(key.frequency);
    
    marble.bounceCount++;
  }

  private createHitEffect(position: THREE.Vector3, color: THREE.Color): void {
    // Create particle burst effect
    const particleCount = 20;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = position.x + (Math.random() - 0.5) * 2;
      positions[i * 3 + 1] = position.y + (Math.random() - 0.5) * 2;
      positions[i * 3 + 2] = position.z + (Math.random() - 0.5) * 2;
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });
    
    const particles = new THREE.Points(geometry, material);
    this.scene.add(particles);
    
    // Remove particles after animation
    setTimeout(() => {
      this.scene.remove(particles);
    }, 1000);
  }

  private playNote(frequency: number): void {
    // 計算撞擊強度（基於玻璃珠的速度）
    const velocity = Math.min(1.0, Math.abs(this.marbles[this.marbles.length - 1]?.velocity.y || 0) / 10);
    
    // 播放木琴音符
    this.xylophoneSynth.playNote(frequency, velocity);
    console.log(`Playing xylophone note: ${frequency}Hz at velocity ${velocity}`);
  }

  private updateTrail(): void {
    if (this.trailPoints.length > 1) {
      const positions = new Float32Array(this.trailPoints.length * 3);
      for (let i = 0; i < this.trailPoints.length; i++) {
        positions[i * 3] = this.trailPoints[i].x;
        positions[i * 3 + 1] = this.trailPoints[i].y;
        positions[i * 3 + 2] = this.trailPoints[i].z;
      }
      
      this.trailGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      this.trailGeometry.attributes.position.needsUpdate = true;
    }
  }

  private updateKeyAnimations(deltaTime: number): void {
    for (let i = 0; i < this.keys.length; i++) {
      const key = this.keys[i];
      const mesh = this.keyMeshes[i];
      
      if (key.isHit) {
        const timeSinceHit = Date.now() - key.hitTime;
        const intensity = Math.max(0, 1 - timeSinceHit / 500); // 500ms animation
        
        // Scale animation
        mesh.scale.y = 1 + intensity * 0.3;
        
        // Color intensity
        const material = mesh.material as THREE.MeshPhongMaterial;
        material.emissive.copy(key.color).multiplyScalar(intensity * 0.5);
        
        if (timeSinceHit > 500) {
          key.isHit = false;
          mesh.scale.y = 1;
          material.emissive.setHex(0x000000);
        }
      }
    }
  }

  // Public methods for external control
  spawnMarbleFromAudio(audioData: { volume: number; bassLevel: number }): void {
    console.log('Audio data:', audioData);
    if (audioData.volume > 0.1 && audioData.bassLevel > 0.1) {
      console.log('Creating marble!');
      this.createMarble(8 + audioData.bassLevel * 5);
    }
  }

  clearMarbles(): void {
    this.marbles.forEach((_, index) => {
      this.scene.remove(this.marbleMeshes[index]);
    });
    this.marbles = [];
    this.marbleMeshes = [];
    this.trailPoints = [];
  }

  // 手動創建玻璃珠用於測試
  createTestMarble(): void {
    console.log('Creating test marble');
    this.createMarble(10);
  }

  // 設置木琴音量
  setXylophoneVolume(volume: number): void {
    this.xylophoneSynth.setVolume(volume);
  }

  dispose(): void {
    this.clearMarbles();
    this.keyMeshes.forEach(mesh => this.scene.remove(mesh));
    this.scene.remove(this.trailLine);
    this.xylophoneSynth.dispose();
  }
}
