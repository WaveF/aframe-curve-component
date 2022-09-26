import './style.css'
import basic from './examples/basic.html?raw';

AFRAME.registerComponent('tracker', {
  init() {
    const size = .1;
    this.el.setAttribute('geometry', 'primitive', 'box');
    this.el.setAttribute('geometry', 'width', size);
    this.el.setAttribute('geometry', 'height', size);
    this.el.setAttribute('geometry', 'depth', size);
    this.el.setAttribute('material', 'color', '#FFF');
    console.log(this.el.object3D)
  },

});


AFRAME.registerComponent('main', {
  init() {
    const track = document.querySelector('#track1');
    const pane = new Tweakpane.Pane({ title: 'tweakpane' });
    for (let i=0; i<track.children.length; i++) {
      const point = track.children[i];
      const { position } = point.object3D;
      const limit = 1;
      pane.addInput({pos:{x:position.x, y:position.y}}, 'pos', {
        label: `point${i+1}`,
        picker: 'inline',
        expanded: i===0,
        x: { min:-limit-1, max:limit+2 },
        y: { min:-limit, max:limit+2, inverted: true }
      }).on('change', e => {
        point.object3D.position.set(e.value.x, e.value.y, -3);
      });
    }
  }
});


document.querySelector('#app').innerHTML = basic;