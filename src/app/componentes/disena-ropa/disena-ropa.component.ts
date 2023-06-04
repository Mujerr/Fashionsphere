import { Component, ViewChild, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { fabric } from 'fabric';
@Component({
  selector: 'app-disena-ropa',
  templateUrl: './disena-ropa.component.html',
  styleUrls: ['./disena-ropa.component.css']
})
export class DisenaRopaComponent implements OnInit  {
  selectedRopa: string = 'Sudadera';
  selectedParte: string = 'delante';
  selectedImage: string = '';
  uploadedImages: string[] = [];
  paintMode: boolean = false;
  brushSize: number = 5;
  brushColor: string = '#000000';
  brushType: string = 'solid';
  canvas!: fabric.Canvas;

  ngOnInit() {
    const canvasElement = document.getElementById('canvas') as HTMLCanvasElement;
    this.canvas = new fabric.Canvas(canvasElement, {
      width: 600,
      height: 600
    });
    this.loadImages();
  }

  loadImages() {
    const imagePath = `assets/img/ropa/${this.selectedRopa}_${this.selectedParte}.jpg`;
  
    fabric.Image.fromURL(imagePath, (img) => {
      if (img.width !== undefined && img.height !== undefined) {
        const canvasWidth = this.canvas.getWidth();
        const canvasHeight = this.canvas.getHeight();
        const scaleFactor = Math.min(canvasWidth / img.width, canvasHeight / img.height);
    
        img.scale(scaleFactor);
        this.canvas.setBackgroundImage(img, this.canvas.renderAll.bind(this.canvas));
      }
    });
  
    this.selectedImage = imagePath;
  }

  handleImageUpload(event: any) {
    const file = event.target.files[0];
    const reader = new FileReader();
  
    reader.onload = (e) => {
      const imageSrc = e.target?.result as string;
      const imgElement = document.createElement('img');
      imgElement.onload = () => {
        const fabricImage = new fabric.Image(imgElement);
        this.canvas.add(fabricImage);
      };
      imgElement.src = imageSrc;
    };
  
    reader.readAsDataURL(file);
  }

  removeImage(image: string) {
    const objects = this.canvas.getObjects();
    const fabricImg = objects.find(obj => obj.name === 'uploadedImage') as fabric.Image;
  
    if (fabricImg && fabricImg.getSrc() === image) {
      this.canvas.remove(fabricImg);
  
      const index = this.uploadedImages.indexOf(image);
      if (index !== -1) {
        this.uploadedImages.splice(index, 1);
      }
    }
  }

  togglePaintMode() {
    this.paintMode = !this.paintMode;
    if (this.paintMode) {
      this.canvas.isDrawingMode = true;
      this.canvas.freeDrawingBrush.width = this.brushSize;
      this.canvas.freeDrawingBrush.color = this.brushColor;
    } else {
      this.canvas.isDrawingMode = false;
    }
  }

  changeBrushSize(size: number) {
    this.brushSize = size;
    this.canvas.freeDrawingBrush.width = this.brushSize;
  }
  
  changeBrushColor(color: string) {
    this.brushColor = color;
    this.canvas.freeDrawingBrush.color = color;
  }


  changeBrushType(type: string) {
    this.brushType = type;
  }

  clearDesign() {
    this.canvas.clear();
    this.loadImages();
  }

  clearUploadedImages() {
    this.canvas.getObjects().forEach(obj => {
      if (obj.name === 'uploadedImage') {
        this.canvas.remove(obj);
      }
    });

    this.uploadedImages = [];
  }

  startDragging(event: any) {
    const target = event.target;
    if (target.nodeName === 'IMG') {
      const id = target.getAttribute('id');
      const index = this.uploadedImages.findIndex(image => image === id);

      if (index !== -1) {
        this.canvas.setActiveObject(this.canvas.getObjects()[index]);
        this.canvas.discardActiveObject();

        this.canvas.on('mouse:move', (e: any) => {
          if (!this.canvas.getActiveObject()) return;
          const pointer = this.canvas.getPointer(e.e);
          this.canvas.getActiveObject()?.set({
            left: pointer.x,
            top: pointer.y
          });
          this.canvas.requestRenderAll();
        });

        this.canvas.on('mouse:up', () => {
          this.canvas.off('mouse:move');
        });
      }
    }
  }
}


