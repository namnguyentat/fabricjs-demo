import React from 'react';
import './App.css';
import { fabric } from 'fabric';

let canvas;
let h = [];
let isRedoing = false;
class App extends React.Component {
  componentDidMount() {
    canvas = this.__canvas = new fabric.Canvas('canvas');
    canvas.on('object:added', function () {
      if (!isRedoing) {
        h = [];
      }
      isRedoing = false;
    });
    window.ca = canvas;
  }

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
        scaleX: 5,
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
      strokeWidth: 2,
      stroke: '#880E4F',
      rx: 10,
      ry: 10,
      angle: 45,
      scaleX: 3,
      scaleY: 3,
      hasControls: true,
      strokeUniform: true,
    });

    canvas.add(rect);
  };

  addCicle = () => {
    const circle2 = new fabric.Circle({
      radius: 65,
      fill: '#4FC3F7',
      left: 100,
      top: 50,
      opacity: 0.7,
      stroke: 'blue',
      strokeWidth: 3,
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
      strokeWidth: 3,
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
            <button onClick={this.addCicle}>Add cicle</button>
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
