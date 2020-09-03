import React from 'react';
import './App.css';
import { fabric } from 'fabric';
import { debounce } from 'lodash';

let canvas;
let h = [];
let isRedoing = false;
class App extends React.Component {
  constructor() {
    super();
    this.state = {
      selectingItem: null,
    };
    window.app = this;
  }

  componentDidMount() {
    canvas = this.__canvas = new fabric.Canvas('canvas');
    const grid = 50;
    const unitScale = 10;
    const canvasWidth = 100 * unitScale;
    const canvasHeight = 100 * unitScale;

    canvas.setWidth(canvasWidth);
    canvas.setHeight(canvasHeight);
    const relayout = debounce(() => this.relayout(), 200);

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
    canvas.on('selection:created', (options) => {
      const target = options.target;
      if (target) {
        switch (target.type) {
          case 'line':
            this.setState({
              selectingItem: {
                type: 'line',
                x1: target.x1,
                x2: target.x2,
                y1: target.y1,
                y2: target.y2,
                strokeWidth: target.strokeWidth,
                stroke: target.stroke,
              },
            });
            break;
          case 'rect':
            this.setState({
              selectingItem: {
                type: 'rect',
                width: target.width,
                height: target.height,
                strokeWidth: target.strokeWidth,
                stroke: target.stroke,
              },
            });
            break;
          case 'circle':
            this.setState({
              selectingItem: {
                type: 'circle',
                radius: target.radius,
                strokeWidth: target.strokeWidth,
                stroke: target.stroke,
                startAngle: target.startAngle,
                endAngle: target.endAngle,
              },
            });
            break;
          default:
            return null;
        }
      }
    });
    canvas.on('selection:updated', (options) => {
      const target = options.target;
      if (options.target) {
        switch (target.type) {
          case 'line':
            this.setState({
              selectingItem: {
                type: 'line',
                x1: target.x1,
                x2: target.x2,
                y1: target.y1,
                y2: target.y2,
                strokeWidth: target.strokeWidth,
                stroke: target.stroke,
              },
            });
            break;
          case 'rect':
            this.setState({
              selectingItem: {
                type: 'rect',
                width: target.width,
                height: target.height,
                strokeWidth: target.strokeWidth,
                stroke: target.stroke,
              },
            });
            break;
          case 'circle':
            this.setState({
              selectingItem: {
                type: 'circle',
                radius: target.radius,
                strokeWidth: target.strokeWidth,
                stroke: target.stroke,
                startAngle: target.startAngle,
                endAngle: target.endAngle,
              },
            });
            break;
          default:
            return null;
        }
      }
    });
    canvas.on('selection:cleared', (options) => {
      this.setState({
        selectingItem: null,
      });
    });

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

  export = () => {
    const content = canvas
      .getObjects()
      .filter((o) => o.selectable)
      .map((o) => {
        switch (o.type) {
          case 'line':
            return {
              type: 'line',
              x1: o.aCoords.tl.x,
              y1: o.aCoords.tl.y,
              x2: o.aCoords.bl.x,
              y2: o.aCoords.bl.y,
              thickness: o.strokeWidth,
              color: o.stroke,
            };
          case 'rect':
            return {
              type: 'rect',
              x1: o.aCoords.tl.x,
              y1: o.aCoords.tl.y,
              x2: o.aCoords.bl.x,
              y2: o.aCoords.bl.y,
              thickness: o.strokeWidth,
              color: o.stroke,
            };
          case 'circle':
            return {
              type: 'circle',
              x: o.left - o.radius,
              y: o.top - o.radius,
              radius: o.radius,
              thickness: o.strokeWidth,
              color: o.stroke,
              startAngle: o.startAngle,
              endAngle: o.endAngle,
            };
          default:
            return null;
        }
      });
    const a = document.createElement('a');
    const file = new Blob([JSON.stringify(content)], { type: 'text/plain' });
    a.href = URL.createObjectURL(file);
    a.download = 'objects.json';
    a.click();
  };

  undo() {
    if (canvas._objects.length > 0) {
      const index = canvas._objects.findIndex((o) => o.selectable);
      if (index > -1) {
        h.push(canvas._objects[index]);
        canvas._objects.splice(index, 1);
        canvas.renderAll();
      }
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
        stroke: '#ff0000',
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
      stroke: '#ff0000',
      hasControls: true,
      strokeUniform: true,
    });

    canvas.add(rect);
  };

  addCircle = () => {
    const circle2 = new fabric.Circle({
      radius: 25,
      fill: '',
      left: 100,
      top: 50,
      stroke: '#ff0000',
      strokeWidth: 5,
      strokeUniform: true,
    });
    canvas.add(circle2);
  };

  addArc = () => {
    const circle1 = new fabric.Circle({
      radius: 50,
      fill: '',
      left: 100,
      top: 50,
      stroke: '#ff0000',
      strokeWidth: 5,
      angle: 0,
      startAngle: 0,
      endAngle: Math.PI,
      strokeUniform: true,
    });

    canvas.add(circle1);
  };

  renderSelectingItem = () => {
    const { selectingItem } = this.state;
    if (!selectingItem) return null;
    switch (selectingItem.type) {
      case 'line':
        return this.renderLineEditor();
      case 'rect':
        return this.renderRectEditor();
      case 'circle':
        return this.renderCircleEditor();
      default:
        return null;
    }
  };

  renderLineEditor = () => {
    const { selectingItem } = this.state;
    return (
      <div>
        <div>-----------------------------------------</div>
        <h2>Editor</h2>
        <label>
          <input
            onChange={(e) => {
              selectingItem.strokeWidth = parseInt(e.target.value);
              this.setState({ selectingItem });
            }}
            value={selectingItem.strokeWidth}
            type="number"
          />
          Thickness
        </label>
        <label>
          <input
            onChange={(e) => {
              selectingItem.stroke = e.target.value;
              this.setState({ selectingItem });
            }}
            value={selectingItem.stroke}
            type="color"
          />
          Color
        </label>
        <div>
          <button onClick={this.updateLine}>Update</button>
        </div>
      </div>
    );
  };

  updateLine = () => {
    const { selectingItem } = this.state;
    const activeObject = canvas.getActiveObject();
    activeObject.set('strokeWidth', selectingItem.strokeWidth);
    activeObject.set('stroke', selectingItem.stroke);
    canvas.renderAll();
  };

  renderRectEditor = () => {
    const { selectingItem } = this.state;
    return (
      <div>
        <div>-----------------------------------------</div>
        <h2>Editor</h2>
        <label>
          <input
            onChange={(e) => {
              selectingItem.width = parseInt(e.target.value);
              this.setState({ selectingItem });
            }}
            value={selectingItem.width}
            type="number"
          />
          Width
        </label>
        <label>
          <input
            onChange={(e) => {
              selectingItem.height = parseInt(e.target.value);
              this.setState({ selectingItem });
            }}
            value={selectingItem.height}
            type="number"
          />
          Height
        </label>
        <label>
          <input
            onChange={(e) => {
              selectingItem.strokeWidth = parseInt(e.target.value);
              this.setState({ selectingItem });
            }}
            value={selectingItem.strokeWidth}
            type="number"
          />
          Thickness
        </label>
        <label>
          <input
            onChange={(e) => {
              selectingItem.stroke = e.target.value;
              this.setState({ selectingItem });
            }}
            value={selectingItem.stroke}
            type="color"
          />
          Color
        </label>
        <div>
          <button onClick={this.updateRect}>Update</button>
        </div>
      </div>
    );
  };

  updateRect = () => {
    const { selectingItem } = this.state;
    const activeObject = canvas.getActiveObject();
    activeObject.set('width', selectingItem.width);
    activeObject.set('height', selectingItem.height);
    activeObject.set('strokeWidth', selectingItem.strokeWidth);
    activeObject.set('stroke', selectingItem.stroke);
    canvas.renderAll();
  };

  renderCircleEditor = () => {
    const { selectingItem } = this.state;
    return (
      <div>
        <div>-----------------------------------------</div>
        <h2>Editor</h2>
        <label>
          <input
            onChange={(e) => {
              selectingItem.radius = parseInt(e.target.value);
              this.setState({ selectingItem });
            }}
            value={selectingItem.radius}
            type="number"
          />
          Radius
        </label>
        <label>
          <input
            onChange={(e) => {
              selectingItem.startAngle = parseFloat(e.target.value);
              this.setState({ selectingItem });
            }}
            value={selectingItem.startAngle}
            type="float"
          />
          Start Angle
        </label>
        <label>
          <input
            onChange={(e) => {
              selectingItem.endAngle = parseFloat(e.target.value);
              this.setState({ selectingItem });
            }}
            value={selectingItem.endAngle}
            type="float"
          />
          End Angle
        </label>
        <label>
          <input
            onChange={(e) => {
              selectingItem.strokeWidth = parseInt(e.target.value);
              this.setState({ selectingItem });
            }}
            value={selectingItem.strokeWidth}
            type="number"
          />
          Thickness
        </label>
        <label>
          <input
            onChange={(e) => {
              selectingItem.stroke = e.target.value;
              this.setState({ selectingItem });
            }}
            value={selectingItem.stroke}
            type="color"
          />
          Color
        </label>
        <div>
          <button onClick={this.updateCircle}>Update</button>
        </div>
      </div>
    );
  };

  updateCircle = () => {
    const { selectingItem } = this.state;
    const activeObject = canvas.getActiveObject();
    activeObject.set('radius', selectingItem.radius);
    activeObject.set('startAngle', selectingItem.startAngle);
    activeObject.set('endAngle', selectingItem.endAngle);
    activeObject.set('strokeWidth', selectingItem.strokeWidth);
    activeObject.set('stroke', selectingItem.stroke);
    canvas.renderAll();
  };

  render() {
    return (
      <div className="App" style={{ display: 'flex' }}>
        <div style={{ border: '1px solid #ccc', margin: '20px' }}>
          <canvas id="canvas" width="800" height="800" />
        </div>
        <div
          className="panel"
          style={{ width: '250px', border: '1px solid #ccc', margin: '20px' }}
        >
          <div className="actions">
            <h2>Action</h2>
            <button
              style={{ display: 'block', marginTop: '10px' }}
              onClick={this.export}
            >
              Export
            </button>
            <button
              style={{ display: 'block', marginTop: '10px' }}
              onClick={this.undo}
            >
              Undo
            </button>
            <button
              style={{ display: 'block', marginTop: '10px' }}
              onClick={this.redo}
            >
              Redo
            </button>
            <button
              style={{ display: 'block', marginTop: '10px' }}
              onClick={this.addLine}
            >
              Add line
            </button>
            <button
              style={{ display: 'block', marginTop: '10px' }}
              onClick={this.addCircle}
            >
              Add circle
            </button>
            <button
              style={{ display: 'block', marginTop: '10px' }}
              onClick={this.addRect}
            >
              Add rectangle
            </button>
            <button
              style={{ display: 'block', marginTop: '10px' }}
              onClick={this.addArc}
            >
              Add ARC
            </button>
          </div>
          {this.renderSelectingItem()}
        </div>
      </div>
    );
  }
}

export default App;
