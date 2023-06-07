import { Component, ViewChild, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { fabric } from 'fabric';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface UploadedImage {
  partIndex: number;
  imageUrl: string;
}

interface Part {
  name: string;
  index: number;
  visible: boolean;
}


@Component({
  selector: 'app-disena-ropa',
  templateUrl: './disena-ropa.component.html',
  styleUrls: ['./disena-ropa.component.css']
})
export class DisenaRopaComponent implements OnInit  {
  // selectedRopa: string = 'Sudadera';
  // selectedParte: string = 'delante';
  // selectedImage: string = '';
  // uploadedImages: string[] = [];
  // paintMode: boolean = false;
  // brushSize: number = 5;
  // brushColor: string = '#000000';
  // brushType: string = 'solid';
  // canvas!: fabric.Canvas;

  // ngOnInit() {
  //   const canvasElement = document.getElementById('canvas') as HTMLCanvasElement;
  //   this.canvas = new fabric.Canvas(canvasElement, {
  //     width: 600,
  //     height: 600
  //   });
  //   this.loadImages();
  // }

  // loadImages() {
  //   const imagePath = `assets/img/ropa/${this.selectedRopa}_${this.selectedParte}.jpg`;
  
  //   fabric.Image.fromURL(imagePath, (img) => {
  //     if (img.width !== undefined && img.height !== undefined) {
  //       const canvasWidth = this.canvas.getWidth();
  //       const canvasHeight = this.canvas.getHeight();
  //       const scaleFactor = Math.min(canvasWidth / img.width, canvasHeight / img.height);
    
  //       img.scale(scaleFactor);
  //       this.canvas.setBackgroundImage(img, this.canvas.renderAll.bind(this.canvas));
  //     }
  //   });
  
  //   this.selectedImage = imagePath;
  // }

  // handleImageUpload(event: any) {
  //   const file = event.target.files[0];
  //   const reader = new FileReader();
  
  //   reader.onload = (e) => {
  //     const imageSrc = e.target?.result as string;
  //     const imgElement = document.createElement('img');
  //     imgElement.onload = () => {
  //       const fabricImage = new fabric.Image(imgElement);
  //       this.canvas.add(fabricImage);
  //     };
  //     imgElement.src = imageSrc;
  //   };
  
  //   reader.readAsDataURL(file);
  // }

  // removeImage(image: string) {
  //   const objects = this.canvas.getObjects();
  //   const fabricImg = objects.find(obj => obj.name === 'uploadedImage') as fabric.Image;
  
  //   if (fabricImg && fabricImg.getSrc() === image) {
  //     this.canvas.remove(fabricImg);
  
  //     const index = this.uploadedImages.indexOf(image);
  //     if (index !== -1) {
  //       this.uploadedImages.splice(index, 1);
  //     }
  //   }
  // }

  // togglePaintMode() {
  //   this.paintMode = !this.paintMode;
  //   if (this.paintMode) {
  //     this.canvas.isDrawingMode = true;
  //     this.canvas.freeDrawingBrush.width = this.brushSize;
  //     this.canvas.freeDrawingBrush.color = this.brushColor;
  //   } else {
  //     this.canvas.isDrawingMode = false;
  //   }
  // }

  // changeBrushSize(size: number) {
  //   this.brushSize = size;
  //   this.canvas.freeDrawingBrush.width = this.brushSize;
  // }
  
  // changeBrushColor(color: string) {
  //   this.brushColor = color;
  //   this.canvas.freeDrawingBrush.color = color;
  // }


  // changeBrushType(type: string) {
  //   this.brushType = type;
  // }

  // clearDesign() {
  //   this.canvas.clear();
  //   this.loadImages();
  // }

  // clearUploadedImages() {
  //   this.canvas.getObjects().forEach(obj => {
  //     if (obj.name === 'uploadedImage') {
  //       this.canvas.remove(obj);
  //     }
  //   });

  //   this.uploadedImages = [];
  // }

  // startDragging(event: any) {
  //   const target = event.target;
  //   if (target.nodeName === 'IMG') {
  //     const id = target.getAttribute('id');
  //     const index = this.uploadedImages.findIndex(image => image === id);

  //     if (index !== -1) {
  //       this.canvas.setActiveObject(this.canvas.getObjects()[index]);
  //       this.canvas.discardActiveObject();

  //       this.canvas.on('mouse:move', (e: any) => {
  //         if (!this.canvas.getActiveObject()) return;
  //         const pointer = this.canvas.getPointer(e.e);
  //         this.canvas.getActiveObject()?.set({
  //           left: pointer.x,
  //           top: pointer.y
  //         });
  //         this.canvas.requestRenderAll();
  //       });

  //       this.canvas.on('mouse:up', () => {
  //         this.canvas.off('mouse:move');
  //       });
  //     }
  //   }
  // }


  @ViewChild('canvasContainer', { static: true })
  canvasContainer!: ElementRef;

  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  renderer!: THREE.WebGLRenderer;
  controls!: OrbitControls;
  model!: THREE.Group;
  matcapTexture!: THREE.Texture;
  colorTexture!: THREE.Texture;
  selectedTextureType: string = 'matcap';
  parts: Part[] = [
    { name: 'Parte 1', index: 0, visible: true },
    { name: 'Parte 2', index: 1, visible: true },
    { name: 'Parte 3', index: 2, visible: true }
    // Agrega más partes según sea necesario
  ];

  constructor() {}

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

  selectPart(index: number): void {
    this.parts.forEach(part => {
      part.visible = part.index === index;
    });

    this.model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const part = this.parts.find(p => p.name === child.name);
        if (part) {
          child.visible = part.visible;
        }
      }
    });

    this.renderer.render(this.scene, this.camera);
  }

}


