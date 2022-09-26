import './style.css'
import basic from './examples/basic.html?raw';
import { Pane } from 'tweakpane'
import './examples/js/aframe-130.min'
import './dist/aframe-curve-component'

AFRAME.registerComponent('main', {
  init() {
    const track = document.querySelector('#track1');
    const pane = new Pane({ title: 'clone-along-curve' });

    const f1 = pane.addFolder({title:'Points'});
    let points = [...track.children];
    let firstPoint = points[0].object3D;
    let lastPoint = points.reverse()[0].object3D;
    let max = 2;
    f1.addInput(firstPoint.position, 'x', { label: 'first', min:0, max }).on('change', e=>{
      lastPoint.position.x = max - firstPoint.position.x;
      pane.refresh();
    });
    f1.addInput(lastPoint.position, 'x', { label: 'last', min:0, max }).on('change', e=>{
      firstPoint.position.x = max - lastPoint.position.x;
      pane.refresh();
    });;

    pane.addSeparator();

    const track1 = document.querySelector('#track1');
    pane.addInput({size:Number(track1.getAttribute('size'))}, 'size', {
      label: 'tracker', min: 0, max: .2
    }).on('change', e => {
      track1.setAttribute('size', e.value);
    });

    const cloner = document.querySelector('[clone-along-curve]');
    pane.addInput(cloner.getAttribute('clone-along-curve'), 'spacing', { min: 0.05, max: 2 });
    pane.addInput(cloner.getAttribute('clone-along-curve'), 'tangent');
  }
});

document.querySelector('#app').innerHTML = basic;