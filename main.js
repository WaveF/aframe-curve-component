import './style.css'
import basic from './examples/basic.html?raw';
import { Pane } from 'tweakpane'
import './examples/js/aframe-130.min'
import './dist/aframe-curve-component'

AFRAME.registerComponent('main', {
  init() {
    const { log, dir, clear } = console;
    const track = document.querySelector('#track1');
    const pane = new Pane({ title: 'clone-along-curve' });

    const f1 = pane.addFolder({title:'Points'});
    let points = [...track.children];
    let firstPoint = points[0].object3D;
    let lastPoint = points.reverse()[0].object3D;
    let distantMax = 3;

    f1.addInput(firstPoint.position, 'x', { label: 'first', min:0, max:distantMax }).on('change', e=>{
      lastPoint.position.x = distantMax - firstPoint.position.x;
      pane.refresh();
    });

    f1.addInput(lastPoint.position, 'x', { label: 'last', min:0, max:distantMax }).on('change', e=>{
      firstPoint.position.x = distantMax - lastPoint.position.x;
      pane.refresh();
    });

    pane.addSeparator();

    const cloner = document.querySelector('[clone-along-curve]');

    pane.addBlade({
      view: 'list',
      label: 'direction',
      options: [
        {text: 'Default', value: 'default'},
        {text: 'Tengent', value: 'tangent'},
        {text: 'Chain',   value: 'chain'},
      ],
      value: 'chain',
    }).on('change', e=>{
      cloner.setAttribute('clone-along-curve', 'direction', e.value);
    });

    const track1 = document.querySelector('#track1');
    pane.addInput({size:Number(track1.getAttribute('size'))}, 'size', {
      label: 'tracker', min: 0, max: .2
    }).on('change', e => {
      track1.setAttribute('size', e.value);
    });

    pane.addInput(cloner.getAttribute('clone-along-curve'), 'spacing', { min: 0.05, max: 2 });

    // 修正gltf模型偏移量
    const chain = this.el.sceneEl.querySelector('#chain');
    chain.addEventListener('model-loaded', e=>{
      const model = chain.object3D.parent;

      // const bbox = new THREE.Box3().setFromObject(model);
      // let center = new THREE.Vector3();
      // bbox.getCenter(center);
      // model.position.sub(center);

      // 顶点偏移
      const offset = 0.025;
      model.traverse(child => {
        if (!child.isMesh) return;
        const geometry = child.geometry;
        const vertices = geometry.attributes.position;
        for (let i = 0; i < vertices.count; i++) {
          vertices.setXYZ(i, vertices.getX(i) + offset, vertices.getY(i), vertices.getZ(i));
        }
        vertices.needsUpdate = true;
      });

    });
  }
});

document.querySelector('#app').innerHTML = basic;