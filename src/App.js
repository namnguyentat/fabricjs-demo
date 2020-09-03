import React from 'react';
import './App.css';
import { fabric } from 'fabric';
import { debounce } from 'lodash';
import line from './images/line.png';
import rect from './images/rect.png';
import circle from './images/circle.png';
import arc from './images/arc.png';
import twoLine from './images/two_line.png';
import crossLine from './images/cross.png';

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
    canvas.on('drop', (event) => {
      console.log(event.e);
      const x = event.e.offsetX;
      const y = event.e.offsetY;
      switch (this.dragItem) {
        case 'line':
          return this.addLine(x, y);
        case 'twoLine':
          return this.addTwoLine(x, y);
        case 'crossLine':
          return this.addCrossLine(x, y);
        case 'rect':
          return this.addRect(x, y);
        case 'circle':
          return this.addCircle(x, y);
        case 'arc':
          return this.addArc(x, y);
        default:
          return null;
      }
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

    // create a rect object
    var deleteIcon =
      "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E";

    var img = document.createElement('img');
    img.src = deleteIcon;
    fabric.Object.prototype.controls.deleteControl = new fabric.Control({
      x: 0.5,
      y: -0.5,
      offsetX: 16,
      offsetY: 16,
      cursorStyle: 'pointer',
      mouseUpHandler: deleteObject,
      render: renderIcon,
      cornerSize: 24,
    });

    function deleteObject(eventData, target) {
      var canvas = target.canvas;
      canvas.remove(target);
      canvas.renderAll();
    }

    function renderIcon(ctx, left, top, styleOverride, fabricObject) {
      var size = this.cornerSize;
      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
      ctx.restore();
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

  addLine = (left, top) => {
    canvas.add(
      new fabric.Line([0, 0, 0, 100], {
        left: left || 100,
        top: top || 50,
        strokeWidth: 5,
        stroke: '#ff0000',
        strokeUniform: true,
      })
    );
  };

  addTwoLine = (left, top) => {
    var poly = new fabric.Polyline(
      [
        { x: 0, y: 0 },
        { x: 0, y: 50 },
        { x: 50, y: 50 },
        { x: 0, y: 50 },
        { x: 0, y: 100 },
      ],
      {
        strokeWidth: 5,
        stroke: '#ff0000',
        left: left || 100,
        top: top || 100,
        fill: '',
        strokeUniform: true,
      }
    );
    canvas.add(poly);
  };

  addCrossLine = (left, top) => {
    var poly = new fabric.Polyline(
      [
        { x: 0, y: 0 },
        { x: 0, y: 50 },
        { x: 50, y: 50 },
        { x: -50, y: 50 },
        { x: 0, y: 50 },
        { x: 0, y: 100 },
      ],
      {
        strokeWidth: 5,
        stroke: '#ff0000',
        left: left || 100,
        top: top || 100,
        fill: '',
        strokeUniform: true,
      }
    );
    canvas.add(poly);
  };

  addRect = (left, top) => {
    const rect = new fabric.Rect({
      left: left || 100,
      top: top || 50,
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

  addCircle = (left, top) => {
    const circle2 = new fabric.Circle({
      radius: 25,
      fill: '',
      left: left || 100,
      top: top || 50,
      stroke: '#ff0000',
      strokeWidth: 5,
      strokeUniform: true,
    });
    canvas.add(circle2);
  };

  addArc = (left, top) => {
    const circle1 = new fabric.Circle({
      radius: 50,
      fill: '',
      left: left || 100,
      top: top || 50,
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

  removeActiveObject = () => {
    const item = canvas.getActiveObject();
    if (item) {
      canvas.remove(item);
      canvas.renderAll();
    }
  };

  flipXObject = () => {
    const item = canvas.getActiveObject();
    if (item) {
      item.set('flipX', !item.flipX);
      canvas.renderAll();
    }
  };

  flipYObject = () => {
    const item = canvas.getActiveObject();
    if (item) {
      item.set('flipY', !item.flipY);
      canvas.renderAll();
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
          <button onClick={this.removeActiveObject}>Remove</button>
          <button onClick={this.flipXObject}>Flip X</button>
          <button onClick={this.flipYObject}>Flip Y</button>
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
          <button onClick={this.removeActiveObject}>Remove</button>
          <button onClick={this.flipXObject}>Flip X</button>
          <button onClick={this.flipYObject}>Flip Y</button>
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
          <button onClick={this.removeActiveObject}>Remove</button>
          <button onClick={this.flipXObject}>Flip X</button>
          <button onClick={this.flipYObject}>Flip Y</button>
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
            <div style={{ display: 'block' }}>
              <img
                src={line}
                onDragStart={() => {
                  this.dragItem = 'line';
                }}
                alt="line"
                dragable="true"
              />
              <img
                src={rect}
                onDragStart={() => {
                  this.dragItem = 'rect';
                }}
                alt="rect"
                dragable="true"
              />
              <img
                src={circle}
                onDragStart={() => {
                  this.dragItem = 'circle';
                }}
                alt="circle"
                dragable="true"
              />
              <img
                src={arc}
                onDragStart={() => {
                  this.dragItem = 'arc';
                }}
                alt="arc"
                dragable="true"
              />
              <img
                src={twoLine}
                onDragStart={() => {
                  this.dragItem = 'twoLine';
                }}
                alt="line"
                dragable="true"
              />
              <img
                src={crossLine}
                onDragStart={() => {
                  this.dragItem = 'crossLine';
                }}
                alt="line"
                dragable="true"
              />
            </div>
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
          </div>
          {this.renderSelectingItem()}
        </div>
      </div>
    );
  }
}

export default App;
