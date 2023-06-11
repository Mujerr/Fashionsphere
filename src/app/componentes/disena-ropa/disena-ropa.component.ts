import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as fabric from 'fabric';



@Component({
  selector: 'app-disena-ropa',
  templateUrl: './disena-ropa.component.html',
  styleUrls: ['./disena-ropa.component.css']
})
export class DisenaRopaComponent implements OnInit  {
  @ViewChild('canvasContainer', { static: true })
  canvasContainer!: ElementRef;
  // canvas!: fabric.Canvas;

  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  renderer!: THREE.WebGLRenderer;
  controls!: OrbitControls;
  model!: THREE.Group;
  matcapTexture!: THREE.Texture;
  colorTexture!: THREE.Texture;
  selectedTextureType: string = 'matcap';
  activeColor: string = '#000000';
  activeBrush: string = 'pencil';

  constructor() {}

  ngOnInit(): void {
    this.initializeScene();
    // this.initializeCanvas();
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
    loader.load('assets/img/ropa/Sudadera.gltf', (gltf) => {
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
      this.camera.aspect = (window.innerWidth / 2) / (window.innerHeight / 2);
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

  // initializeCanvas(): void {
  //   this.canvas = new fabric.Canvas(this.canvasContainer.nativeElement);

  //   const brushOptions = {
  //     width: 10,
  //     color: this.activeColor,
  //     opacity: 1,
  //     shadow: new fabric.Shadow({
  //       color: 'rgba(0,0,0,0.3)',
  //       blur: 5,
  //       offsetX: 2,
  //       offsetY: 2
  //     })
  //   };

  //   this.canvas.freeDrawingBrush = this.getBrush(this.activeBrush);
  //   this.canvas.freeDrawingBrush.width = brushOptions.width;
  //   this.canvas.freeDrawingBrush.color = brushOptions.color;
  //   this.canvas.freeDrawingBrush.shadow = brushOptions.shadow;

  //   this.canvas.isDrawingMode = true;
  // }

  // changeColor(event: Event): void {
  //   const color = (event.target as HTMLInputElement).value;
  //   this.activeColor = color;
  //   this.canvas.freeDrawingBrush.color = color;
  // }

  //   changeBrush(brush: string): void {
  //   this.activeBrush = brush;
  //   this.canvas.freeDrawingBrush = this.getBrush(brush);
  //   this.canvas.freeDrawingBrush.width = 10;
  //   this.canvas.freeDrawingBrush.color = this.activeColor;
  //   this.canvas.freeDrawingBrush.shadow = new fabric.Shadow({
  //     color: 'rgba(0,0,0,0.3)',
  //     blur: 5,
  //     offsetX: 2,
  //     offsetY: 2
  //   });
  // }


  // getBrush(brushType: string): fabric.BaseBrush {
  //   switch (brushType) {
  //     case 'circle':
  //       return new fabric.CircleBrush();
  //     case 'spray':
  //       return new fabric.SprayBrush();
  //     default:
  //       return new fabric.PencilBrush(this.canvas);
  //   }
  // }


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
      this.applyColorTexture();
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

  applyColorTexture(): void {
    if (this.model && this.colorTexture) {
      this.model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const material = new THREE.MeshStandardMaterial({ map: this.colorTexture });
          child.material = material;
        }
      });
      this.renderer.render(this.scene, this.camera);
    }
  }









}


