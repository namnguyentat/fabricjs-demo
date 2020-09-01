import React from 'react';
import './App.css';
import { fabric } from 'fabric';
import { debounce } from 'lodash';

let canvas;
let h = [];
let isRedoing = false;
class App extends React.Component {
  componentDidMount() {
    canvas = this.__canvas = new fabric.Canvas('canvas');
    const grid = 50;
    const unitScale = 10;
    const canvasWidth = 100 * unitScale;
    const canvasHeight = 100 * unitScale;

    canvas.setWidth(canvasWidth);
    canvas.setHeight(canvasHeight);
    const relayout = debounce(() => this.relayout(), 200);

    // create grid

    for (let i = 0; i < canvasWidth / grid; i++) {
      canvas.add(
        new fabric.Line([i * grid, 0, i * grid, canvasHeight], {
          type: 'line',
          stroke: '#ccc',
          selectable: false,
          excludeFromExport: true,
        })
      );
      canvas.add(
        new fabric.Line([0, i * grid, canvasWidth, i * grid], {
          type: 'line',
          stroke: '#ccc',
          selectable: false,
          excludeFromExport: true,
        })
      );
    }
    canvas.on('object:added', () => {
      if (!isRedoing) {
        h = [];
      }
      isRedoing = false;
      relayout();
    });
    // snap to grid

    canvas.on('object:moving', function (options) {
      const target = options.target;
      if (target.type === 'rect' || target.type === 'circle') {
        options.target.set({
          left: Math.round(options.target.left / grid) * grid,
          top: Math.round(options.target.top / grid) * grid,
        });
      }
      relayout();
    });
    canvas.on('object:modified', function (options) {
      const target = options.target;
      if (target.type === 'rect') {
        const scaleX = target.scaleX;
        const scaleY = target.scaleY;
        var newWidth = Math.round((target.width * scaleX) / grid) * grid;
        var newHeight = Math.round((target.height * scaleY) / grid) * grid;
        options.target.set('width', newWidth);
        options.target.set('height', newHeight);
        options.target.set('scaleX', 1);
        options.target.set('scaleY', 1);
      } else if (target.type === 'circle') {
        const scaleX = target.scaleX;
        const newRadius =
          (parseInt((2 * target.radius * scaleX) / grid) * grid) / 2;
        console.log(newRadius);
        if (newRadius >= 25) {
          target.set('radius', newRadius);
          target.set('scaleX', 1);
          target.set('scaleY', 1);
        } else {
          target.set('radius', 25);
          target.set('scaleX', 1);
          target.set('scaleY', 1);
        }
      }
    });
    window.ca = canvas;
  }

  relayout = () => {
    const items = canvas.getObjects();
    items.forEach((item) => {
      if (item.selectable) {
        switch (item.type) {
          case 'line':
            canvas.sendToBack(item);
            break;
          case 'circle':
            canvas.bringToFront(item);
            break;
          default:
            console.log(item.type);
        }
      }
    });
  };

  undo() {
    if (canvas._objects.length > 0) {
      h.push(canvas._objects.pop());
      canvas.renderAll();
    }
  }

  redo() {
    if (h.length > 0) {
      isRedoing = true;
      canvas.add(h.pop());
    }
  }

  addLine = () => {
    canvas.add(
      new fabric.Line([0, 0, 0, 100], {
        left: 100,
        top: 50,
        strokeWidth: 5,
        stroke: 'red',
        strokeUniform: true,
      })
    );
  };

  addRect = () => {
    const rect = new fabric.Rect({
      left: 100,
      top: 50,
      fill: '',
      width: 50,
      height: 50,
      strokeWidth: 5,
      stroke: '#880E4F',
      hasControls: true,
      strokeUniform: true,
    });

    canvas.add(rect);
  };

  addCircle = () => {
    const circle2 = new fabric.Circle({
      radius: 25,
      fill: '#4FC3F7',
      left: 100,
      top: 50,
      opacity: 0.7,
      stroke: 'blue',
      strokeWidth: 5,
      strokeUniform: true,
    });
    canvas.add(circle2);
  };

  addArc = () => {
    const circle1 = new fabric.Circle({
      radius: 65,
      fill: '',
      left: 100,
      top: 50,
      stroke: 'red',
      strokeWidth: 5,
      angle: 0,
      startAngle: 0,
      endAngle: Math.PI,
      strokeUniform: true,
    });

    canvas.add(circle1);
  };

  render() {
    return (
      <div className="App" style={{ display: 'flex' }}>
        <div style={{ border: '1px solid #ccc', margin: '20px' }}>
          <canvas id="canvas" width="1000" height="800" />
        </div>
        <div
          className="panel"
          style={{ border: '1px solid #ccc', margin: '20px' }}
        >
          <div>
            <button onClick={this.undo}>Undo</button>
          </div>
          <div>
            <button onClick={this.redo}>Redo</button>
          </div>
          <div>
            <button onClick={this.addLine}>Add line</button>
          </div>
          <div>
            <button onClick={this.addCircle}>Add circle</button>
          </div>
          <div>
            <button onClick={this.addRect}>Add rectangle</button>
          </div>
          <div>
            <button onClick={this.addArc}>Add ARC</button>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
