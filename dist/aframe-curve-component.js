/******/
(function (modules) { // webpackBootstrap
	/******/ // The module cache
	/******/
	var installedModules = {};

	/******/ // The require function
	/******/
	function __webpack_require__(moduleId) {

		/******/ // Check if module is in cache
		/******/
		if (installedModules[moduleId])
			/******/
			return installedModules[moduleId].exports;

		/******/ // Create a new module (and put it into the cache)
		/******/
		var module = installedModules[moduleId] = {
			/******/
			exports: {},
			/******/
			id: moduleId,
			/******/
			loaded: false
			/******/
		};

		/******/ // Execute the module function
		/******/
		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

		/******/ // Flag the module as loaded
		/******/
		module.loaded = true;

		/******/ // Return the exports of the module
		/******/
		return module.exports;
		/******/
	}


	/******/ // expose the modules object (__webpack_modules__)
	/******/
	__webpack_require__.m = modules;

	/******/ // expose the module cache
	/******/
	__webpack_require__.c = installedModules;

	/******/ // __webpack_public_path__
	/******/
	__webpack_require__.p = "";

	/******/ // Load entry module and return exports
	/******/
	return __webpack_require__(0);
	/******/
})
/************************************************************************/
/******/
([
	/* 0 */
	/***/
	(function (module, exports) {

		/* global AFRAME */

		if (typeof AFRAME === 'undefined') {
			throw new Error('Component attempted to register before AFRAME was available.');
		}

		AFRAME.registerComponent('curve-point', {

			dependencies: ['position'],
		
			schema: {
				color: {
					type: 'color',
					default: '#fff'
				},
				fps: {
					type: 'number',
					default: 0
				}
			},
		
			init: function () {
				this.el.emit("curve-point-changed");
		
				this.oldPos = { ...this.el.object3D.position };

				if (this.data.fps > 0) {
					this.loop(function(){
						let newPos = { ...this.el.object3D.position };
						if (JSON.stringify(this.oldPos) !== JSON.stringify(newPos)) {
							this.el.emit("curve-point-changed");
							this.oldPos = newPos;
						}
					}.bind(this), this.data.fps);
				}
			},
		
			loop: function (callback, fps) {
				let then = Date.now();
				let now = then;
				let elapsedTime = 0;
				let fpsInterval = 1000 / fps;
				let raf = () => {
					requestAnimationFrame(raf);
					now = Date.now();
					elapsedTime = now - then;
					if (elapsedTime > fpsInterval) {
						then = now - (elapsedTime % fpsInterval);
						callback();
					}
				};
				raf();
			}
		});
		
		
		AFRAME.registerComponent('curve', {
		
			dependencies: ['curve-point'],
		
			schema: {
				size: {
					type: 'number',
					default: .1
				},
				type: {
					type: 'string',
					default: 'CatmullRom',
					oneOf: ['CatmullRom', 'CubicBezier', 'QuadraticBezier', 'Line']
				},
				closed: {
					type: 'boolean',
					default: false
				},
				fps: {
					type: 'number',
					default: 0
				}
			},
		
			init: function () {
				this.pathPoints = null;
				this.curve = null;

				if (this.data.fps > 0) {
					this.loop(this.update.bind(this), this.data.fps);
				} else {
					this.el.addEventListener("curve-point-changed", this.update.bind(this));
				}
			},
		
			update: function (oldData) {
				this.points = Array.from(this.el.querySelectorAll("a-curve-point, [curve-point]"));
				this.points.forEach(point => {
					const tagName = point.tagName.toLowerCase();
					if (this.data.size > 0 && tagName === 'a-curve-point') {
						point.setAttribute('geometry', 'primitive', 'box');
						point.setAttribute('geometry', 'width',  this.data.size);
						point.setAttribute('geometry', 'height', this.data.size);
						point.setAttribute('geometry', 'depth',  this.data.size);
						point.setAttribute('material', 'color', '#FFF');
						point.setAttribute('material', 'transparent', true);
						point.setAttribute('material', 'opacity', .5);
					}
				});

		
				if (this.points.length <= 1) {
					console.warn("At least 2 curve-points needed to draw a curve");
					this.curve = null;
				} else {
					// Get Array of Positions from Curve-Points
					var pointsArray = this.points.map(function (point) {
						let pos;
						if (point.x !== undefined && point.y !== undefined && point.z !== undefined) {
							pos = point;
						} else {
							pos = point.object3D.getWorldPosition(new THREE.Vector3());
						}
						return pos;
					});
		
					// Update the Curve if either the Curve-Points or other Properties changed
					if (!AFRAME.utils.deepEqual(pointsArray, this.pathPoints) || (oldData !== 'CustomEvent' && !AFRAME.utils.deepEqual(this.data, oldData))) {
						this.curve = null;
		
						this.pathPoints = pointsArray;
		
						// Create Curve
						switch (this.data.type) {
							case 'CubicBezier':
								if (this.pathPoints.length != 4) {
									throw new Error('The Three constructor of type CubicBezierCurve3 requires 4 points');
								}
								this.curve = new THREE.CubicBezierCurve3(this.pathPoints[0], this.pathPoints[1], this.pathPoints[2], this.pathPoints[3]);
								break;
							case 'QuadraticBezier':
								if (this.pathPoints.length != 3) {
									throw new Error('The Three constructor of type QuadraticBezierCurve3 requires 3 points');
								}
								this.curve = new THREE.QuadraticBezierCurve3(this.pathPoints[0], this.pathPoints[1], this.pathPoints[2]);
								break;
							case 'Line':
								if (this.pathPoints.length != 2) {
									throw new Error('The Three constructor of type LineCurve3 requires 2 points');
								}
								this.curve = new THREE.LineCurve3(this.pathPoints[0], this.pathPoints[1]);
								break;
							case 'CatmullRom':
								this.curve = new THREE.CatmullRomCurve3(this.pathPoints);
								break;
							case 'Spline':
								let points = this.pathPoints.map(point => {
									return new THREE.Vector2(point.x, point.y);
								});
								this.curve = new THREE.SplineCurve(points);
								break;
							default:
								throw new Error('No Three constructor of type (case sensitive): ' + this.data.type + 'Curve3');
						}
		
						this.curve.closed = this.data.closed;
		
						this.el.emit('curve-updated');
					}
				}
		
			},
		
			remove: function () {
				this.el.removeEventListener("curve-point-changed", this.update.bind(this));
			},
		
			closestPointInLocalSpace: function closestPoint(point, resolution, testPoint, currentRes) {
				if (!this.curve) throw Error('Curve not instantiated yet.');
				resolution = resolution || 0.1 / this.curve.getLength();
				currentRes = currentRes || 0.5;
				testPoint = testPoint || 0.5;
				currentRes /= 2;
				var aTest = testPoint + currentRes;
				var bTest = testPoint - currentRes;
				var a = this.curve.getPointAt(aTest);
				var b = this.curve.getPointAt(bTest);
				var aDistance = a.distanceTo(point);
				var bDistance = b.distanceTo(point);
				var aSmaller = aDistance < bDistance;
				if (currentRes < resolution) {
					var tangent = this.curve.getTangentAt(aSmaller ? aTest : bTest);
					if (currentRes < resolution) return {
						result: aSmaller ? aTest : bTest,
						location: aSmaller ? a : b,
						distance: aSmaller ? aDistance : bDistance,
						normal: this.normalFromTangent(tangent),
						tangent: tangent
					};
				}
				if (aDistance < bDistance) {
					return this.closestPointInLocalSpace(point, resolution, aTest, currentRes);
				} else {
					return this.closestPointInLocalSpace(point, resolution, bTest, currentRes);
				}
			},
		
			normalFromTangent: function (tangent) {
				var lineEnd = new THREE.Vector3(0, 1, 0);
				var tempQuaternion = new THREE.Quaternion();
				var zAxis = new THREE.Vector3(0, 0, 1);
				tempQuaternion.setFromUnitVectors(zAxis, tangent);
				lineEnd.applyQuaternion(tempQuaternion);
				return lineEnd;
			},

			loop: function (callback, fps) {
				let then = Date.now();
				let now = then;
				let elapsedTime = 0;
				let fpsInterval = 1000 / fps;
				let raf = () => {
					requestAnimationFrame(raf);
					now = Date.now();
					elapsedTime = now - then;
					if (elapsedTime > fpsInterval) {
						then = now - (elapsedTime % fpsInterval);
						callback();
					}
				};
				raf();
			},
		});
		
		
		AFRAME.registerShader('line', {
			schema: {
				color: {
					default: '#ff0000'
				},
			},
		
			init: function (data) {
				this.material = new THREE.LineBasicMaterial(data);
			},
		
			update: function (data) {
				this.material = new THREE.LineBasicMaterial(data);
			},
		});
		
		
		AFRAME.registerComponent('draw-curve', {
		
			// dependencies: ['curve', 'material'],
		
			schema: {
				curve: {
					type: 'selector'
				},
				color: {
					type: 'color',
					default: '#f00'
				}
			},
		
			init: function () {
				if (this.data.curve) {
					this.data.curve.addEventListener('curve-updated', this.update.bind(this));
				}
			},
		
			update: function () {
				if (this.data.curve) {
					this.curve = this.data.curve.components.curve;
				}
		
				if (this.curve && this.curve.curve) {
					var bufferGeometry = new THREE.BufferGeometry();
					if (bufferGeometry.setFromPoints) {
						var lineGeometry = bufferGeometry.setFromPoints(this.curve.curve.getPoints(this.curve.curve.getPoints().length * 10));
					}
					this.el.setObject3D('mesh', new THREE.Line());

					let lineMaterial = new THREE.LineBasicMaterial({
						color: this.data.color
					});
		
					this.el.setObject3D('mesh', new THREE.Line(lineGeometry, lineMaterial));
				}
			},
		
			remove: function () {
				this.data.curve.removeEventListener('curve-updated', this.update.bind(this));
				this.el.getObject3D('mesh').geometry = new THREE.Geometry();
			}
		});
		
		
		AFRAME.registerComponent('clone-along-curve', {
		
			//dependencies: ['curve'],
		
			schema: {
				curve: {
					type: 'selector'
				},
				spacing: {
					default: 1
				},
				rotation: {
					type: 'vec3',
					default: { x: 0, y: 0, z: 0 }
				},
				scale: {
					type: 'vec3',
					default: { x: 1, y: 1, z: 1 }
				},
				direction: {
					type: 'string',
					default: 'default',
					oneOf: ['default', 'tangent', 'chain']
				}
			},
		
			init: function () {
				this.el.addEventListener('model-loaded', this.update.bind(this));
				this.data.curve.addEventListener('curve-updated', this.update.bind(this));
			},
		
			update: function () {
				this.remove();
		
				if (this.data.curve) {
					this.curve = this.data.curve.components.curve;
				}
		
				if (!this.el.getObject3D('clones') && this.curve && this.curve.curve) {
					var mesh = this.el.getObject3D('mesh');
					if (!mesh) return;

					var length = this.curve.curve.getLength();
					var start = 0;
					var counter = start;
					
					this.el.setObject3D('clones', new THREE.Group());
					var cloneMesh = this.el.object3D;
					cloneMesh.clear();
		
					var degToRad = THREE.Math.degToRad;
		
					var parent = new THREE.Object3D();
					mesh.scale.set(this.data.scale.x, this.data.scale.y, this.data.scale.z);
					mesh.rotation.set(degToRad(this.data.rotation.x), degToRad(this.data.rotation.y), degToRad(this.data.rotation.z));
					mesh.rotation.order = 'YXZ';
		
					parent.add(mesh);
		
					var tangent, zAxis;
					while (counter <= length) {
						var child = parent.clone(true);
						child.position.copy(this.curve.curve.getPointAt(counter / length));
						tangent = this.curve.curve.getTangentAt(counter / length).normalize();

						if (this.data.direction == 'tangent') {
							zAxis = new THREE.Vector3(0, 0, 1);
							child.quaternion.setFromUnitVectors(zAxis, tangent);
						}
						else if (this.data.direction == 'chain') {
							zAxis = tangent.clone();
							child.quaternion.setFromUnitVectors(zAxis, tangent);
							child.rotation.z += Math.atan(tangent.y / tangent.x);
						}
						
						cloneMesh.add(child);
						counter += this.data.spacing;
					}
				}
			},
		
			remove: function () {
				this.curve = null;
				if (this.el.getObject3D('clones')) {
					this.el.removeObject3D('clones');
				}
			}
		
		});
		
		
		AFRAME.registerPrimitive('a-draw-curve', {
			defaultComponents: {
				'draw-curve': {},
			},
			mappings: {
				curve: 'draw-curve.curve',
				color: 'draw-curve.color'
			}
		});
		
		
		AFRAME.registerPrimitive('a-curve-point', {
			defaultComponents: {
				'curve-point': {},
			},
			mappings: {}
		});
		
		
		AFRAME.registerPrimitive('a-curve', {
			defaultComponents: {
				'curve': {}
			},
		
			mappings: {
				type: 'curve.type',
				fps: 'curve.fps',
				size: 'curve.size'
			}
		});		


		/***/
	})
	/******/
]);