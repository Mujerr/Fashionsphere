import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-disena-ropa',
  templateUrl: './disena-ropa.component.html',
  styleUrls: ['./disena-ropa.component.css']
})
export class DisenaRopaComponent implements OnInit {
  @ViewChild('canvasContainer', { static: true })
  canvasContainer!: ElementRef;

  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  renderer!: THREE.WebGLRenderer;
  controls!: OrbitControls;
  model!: THREE.Group;
  selectedTextureType: string = 'matcap';
  selectedPrenda: string | null = null;
  matcapTexture!: THREE.Texture;
  colorTexture!: THREE.Texture;
  activeColor: THREE.ColorRepresentation | undefined;
  repeatOption: string ='';
  prendaSeleccionada: string = '';

  constructor(
    private afAuth: AngularFireAuth,
    private storage: AngularFireStorage,
    private firestore: AngularFirestore
  ) {}

  ngOnInit(): void {
    this.initializeScene();
  }

  initializeScene(): void {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(-100, 0, 0);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
    this.canvasContainer.nativeElement.appendChild(this.renderer.domElement);

    this.controls = this.getControls(this.camera, this.renderer.domElement);

    const loader = new GLTFLoader();
    loader.load('assets/img/ropa/Sudadera/Sudadera.gltf', (gltf) => {
      this.model = gltf.scene;
      this.model.scale.set(150, 150, 150);

      this.scene.add(this.model);

      this.model.position.y = -200;

      const ambientLight = new THREE.AmbientLight(0xffffff, 1);
      this.scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(0, 1, 0);
      this.scene.add(directionalLight);

      this.animate();
    });

    this.camera.position.z = 100;

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
    });
  }

  getControls(camera: THREE.Camera, domElement: HTMLElement): OrbitControls {
    const controls = new OrbitControls(camera, domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    return controls;
  }

  animate(): void {
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
  
  onTextureImageChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const imageUrl = e.target.result;
        this.applyTexture(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  }

  applyTexture(imageUrl: string): void {
    const texture = new THREE.TextureLoader().load(imageUrl);
    if (this.selectedTextureType === 'matcap') {
      this.matcapTexture = texture;
      this.applyMatcapTexture();
    } else if (this.selectedTextureType === 'color') {
      this.colorTexture = texture;
      this.applyImageColorTexture();
    }
  }

  applyMatcapTexture(): void {
    if (this.model && this.matcapTexture) {
      this.model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const material = new THREE.MeshMatcapMaterial({ matcap: this.matcapTexture });
          child.material = material;
        }
      });
      this.renderer.render(this.scene, this.camera);
    }
  }

  applyImageColorTexture(): void {
    if (this.model && this.colorTexture) {
      this.model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const material = new THREE.MeshStandardMaterial({ map: this.colorTexture });
  
          if (this.repeatOption === 'repeat' && material.map) {
            material.map.wrapS = THREE.RepeatWrapping;
            material.map.wrapT = THREE.RepeatWrapping;
            material.map.repeat.set(4, 4); // Aumenta los valores para repetir más veces la textura
          } else if (material.map) {
            material.map.wrapS = THREE.ClampToEdgeWrapping;
            material.map.wrapT = THREE.ClampToEdgeWrapping;
          }
  
          child.material = material;
        }
      });
  
      this.renderer.render(this.scene, this.camera);
    }
  }
  

  applyColorTexture(): void {
    if (this.model) {
      const color = new THREE.Color(this.activeColor);
  
      this.model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const material = new THREE.MeshStandardMaterial({ color });
          child.material = material;
        }
      });
  
      this.renderer.render(this.scene, this.camera);
    }
  }

}


