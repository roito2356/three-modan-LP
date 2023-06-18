import './style.css'
import * as THREE from "three";
import * as dat from "lil-gui";

/**
 * s12-94 UIデバッグを実装
 */
const gui = new dat.GUI();

// HTMLのキャンバスの取得
const canvas = document.querySelector(".webgl");

/**
 * s12-90必須の3要素を追加しよう
 * (シーン, カメラ, レンダラー)
 */
// シーン
const scene = new THREE.Scene();

// サイズ設定
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

// カメラ
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 6;
scene.add(camera);

// レンダラー
const renderer = new THREE.WebGL1Renderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(window.devicePixelRatio);

/**
 * s12-91 オブジェクトを作成しよう
 * (マテリアル, メッシュ, 回転用に配置, オブジェクトをシーンに追加)
 */
// マテリアル
const material = new THREE.MeshPhysicalMaterial({
  color: "#3c94d7",
  metalness: 0.86,
  roughness: 0.37,
  flatShading: true,
});

// GUIで色の項目を追加
gui.addColor(material, "color");
// GUIで金属製の項目を追加
gui.add(material, "metalness").min(0).max(1).step(0.001);
// GUIで粗さの項目を追加
gui.add(material, "roughness").min(0).max(1).step(0.001);

// メッシュ(ジオメトリの作成とメッシュ化を同時に行っている)
const mesh1 = new THREE.Mesh(new THREE.TorusGeometry(1, 0.4, 16, 60),material);
const mesh2 = new THREE.Mesh(new THREE.OctahedronGeometry(),material);
const mesh3 = new THREE.Mesh(new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),material);
const mesh4 = new THREE.Mesh(new THREE.IcosahedronGeometry(),material);

// 回転用に配置
mesh1.position.set(2, 0, 0);
mesh2.position.set(-1, 0, 0);
mesh3.position.set(2, 0, -6);
mesh4.position.set(5, 0, 3);

// オブジェクトをシーンに追加
scene.add(mesh1, mesh2, mesh3, mesh4);

// methを回転させる為に配列を作成する
const meshes = [mesh1, mesh2, mesh3, mesh4]; 

/**
 * s12-101 パーティクルを追加してみよう
 */
// パーティクルのジオメトリ
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 700;

const positionArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++){
  positionArray[i] = (Math.random() - 0.5) * 10;
}

particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positionArray, 3));

// パーティクルのマテリアル
const particlesMaterial = new THREE.PointsMaterial({
  size: 0.025,
  color: "#ffffff",
});

// パーティクルのメッシュ化
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

/**
 * s12-92 ライトを追加
 */
const directionalLight = new THREE.DirectionalLight("#ffffff", 4);
directionalLight.position.set(0.5, 1, 0);
scene.add(directionalLight);

/** 
 * s12-93 ブラウザのリサイズ操作
 * (サイズのアップデート, アニメーション)
*/
// サイズのアップデート
window.addEventListener("resize", () => {
  // サイズのアップデート
  sizes.width = window.innerWidth,
  sizes.height = window.innerHeight,

  // カメラのアップデート
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // レンダラーのアップデート
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(window.devicePixelRatio);
})

// s12-96 ホイールを実装してみよう
let speed = 0;
let rotation = 0;
window.addEventListener("wheel", (event) => {
  speed += event.deltaY * 0.0002;
  console.log(event.deltaY);
});

function rot() {
  rotation += speed;
  speed *= 0.93;

  // s12-97 ジオメトリ全体を回転させる
  mesh1.position.x = 2 + 3.8 * Math.cos(rotation);
  mesh1.position.z = -3 + 3.8 * Math.sin(rotation);

  mesh2.position.x = 2 + 3.8 * Math.cos(rotation + Math.PI / 2);
  mesh2.position.z = -3 + 3.8 * Math.sin(rotation + Math.PI / 2);

  mesh3.position.x = 2 + 3.8 * Math.cos(rotation + Math.PI);
  mesh3.position.z = -3 + 3.8 * Math.sin(rotation + Math.PI);

  mesh4.position.x = 2 + 3.8 * Math.cos(rotation + 3 * (Math.PI / 2));
  mesh4.position.z = -3 + 3.8 * Math.sin(rotation + 3 * (Math.PI / 2));

  window.requestAnimationFrame(rot);
}

rot();

// カーソルの位置によって動くアニメーションを追加
// s12-99 カーソルの位置を取得
const cursor = {};
cursor.x =0;
cursor.y = 0;

window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = event.clientY / sizes.height - 0.5;
  // console.log(cursor);
})

// アニメーション

const clock = new THREE.Clock();

const animate = () => {
  // レンダラでシーンとカメラをブラウザ上に追加
  renderer.render(scene, camera);

  // 経過時間を取得
  let getDeltaTime = clock.getDelta();
  // console.log(getDeltaTime);

  // s12-95 methをを回転させる
  for(const mesh of meshes){
    mesh.rotation.x += 0.1 * getDeltaTime;
    mesh.rotation.y += 0.12 * getDeltaTime;
  }

  // s12-100 カメラの制御をしよう
  camera.position.x += cursor.x * getDeltaTime * 2.5;
  camera.position.y += -cursor.y * getDeltaTime * 2.5;
  // console.log(camera.position);
  // ジオメトリがカメラ外にいかないようにする
  if(cursor.x>0.45 || cursor.x<-0.45 || cursor.y>0.45 || cursor.y<-0.45){
    camera.position.x = 0;
    camera.position.y = 0;
  }
  if(camera.position.x>2 || camera.position.x<-2 || camera.position.y>1 || camera.position.y<-1){
    camera.position.x -= cursor.x * getDeltaTime * 2.5;
    camera.position.y -= -cursor.y * getDeltaTime * 2.5;
  }

  // フレームごとにアニメーションを起動
  window.requestAnimationFrame(animate);
};

animate();