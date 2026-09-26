const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

camera.position.set(0, 12, 28);
camera.lookAt(0, 0, 0);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Textura suave para partículas brillantes
function createParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.2, 'rgba(255,105,180,0.9)');
    gradient.addColorStop(0.6, 'rgba(138,43,226,0.4)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    
    return new THREE.CanvasTexture(canvas);
}

const particleTexture = createParticleTexture();

// 1. Galaxia de Partículas
const particleCount = 7000;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);

const colorInside = new THREE.Color('#ff2a85');
const colorOutside = new THREE.Color('#8a2be2');

for (let i = 0; i < particleCount; i++) {
    const radius = Math.random() * 24 + 0.5;
    const spinAngle = radius * 0.8;
    const branchAngle = ((i % 4) * 2 * Math.PI) / 4;

    const randomX = (Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1)) * 2.5;
    const randomY = (Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1)) * 2.5;
    const randomZ = (Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1)) * 2.5;

    positions[i * 3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[i * 3 + 1] = randomY;
    positions[i * 3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

    const mixedColor = colorInside.clone().lerp(colorOutside, radius / 24);
    colors[i * 3] = mixedColor.r;
    colors[i * 3 + 1] = mixedColor.g;
    colors[i * 3 + 2] = mixedColor.b;
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const galaxy = new THREE.Points(geometry, new THREE.PointsMaterial({
    size: 0.6,
    map: particleTexture,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false
}));
scene.add(galaxy);

// 2. Árbol de Corazones en 3D Central
const treeGroup = new THREE.Group();
const heartPositions = [];
for(let i = 0; i < 200; i++) {
    const t = Math.PI * (Math.random() * 2 - 1);
    const x = 16 * Math.pow(Math.sin(t), 3) * 0.18;
    const y = (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)) * 0.18 + 2;
    const z = (Math.random() - 0.5) * 3;
    heartPositions.push(x, y, z);
}
const heartGeo = new THREE.BufferGeometry();
heartGeo.setAttribute('position', new THREE.Float32BufferAttribute(heartPositions, 3));

const heartTree = new THREE.Points(heartGeo, new THREE.PointsMaterial({
    size: 0.9,
    map: particleTexture,
    color: 0xff1493,
    transparent: true,
    blending: THREE.AdditiveBlending
}));
treeGroup.add(heartTree);
scene.add(treeGroup);

// 3. Textos Interactivos Flotantes
function createFloatingText(text, id) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 128;

    ctx.font = 'Bold 42px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#ff1493';
    ctx.shadowBlur = 18;
    ctx.fillText(text, 256, 70);

    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ 
        map: new THREE.CanvasTexture(canvas), 
        transparent: true, 
        blending: THREE.AdditiveBlending 
    }));
    sprite.scale.set(7.5, 1.85, 1);
    sprite.userData = { id: id };
    return sprite;
}

const phrasesData = [
    { text: "✨ Danely ✨", id: "danely" },
    { text: "🎂 26 / 09 🎂", id: "date" },
    { text: "💖 Feliz Cumple 💖", id: "cumple" },
    { text: "✈️ Tócame ✈️", id: "plane" }
];

const textGroup = new THREE.Group();
const interactiveSprites = [];

phrasesData.forEach((item, index) => {
    const sprite = createFloatingText(item.text, item.id);
    const angle = (index / phrasesData.length) * Math.PI * 2;
    sprite.position.set(Math.cos(angle) * 13, (Math.random() - 0.5) * 2, Math.sin(angle) * 13);
    textGroup.add(sprite);
    interactiveSprites.push(sprite);
});
scene.add(textGroup);

// Funciones Interactivas y Confeti
function triggerConfetti() {
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ff1493', '#ff69b4', '#8a2be2', '#ffffff']
        });
    }
}

function showToast(msg) {
    const toast = document.getElementById('toast-msg');
    toast.innerText = msg;
    toast.classList.add('show');
    triggerConfetti();
    setTimeout(() => toast.classList.remove('show'), 3200);
}

function launchAirplane() {
    const plane = document.getElementById('airplane-container');
    plane.classList.remove('fly');
    void plane.offsetWidth;
    plane.classList.add('fly');
    triggerConfetti();
}

// Reproducción de Música
const bgMusic = document.getElementById('bg-music');
let musicStarted = false;

function startAudio() {
    if (!musicStarted && bgMusic) {
        bgMusic.play().then(() => {
            musicStarted = true;
        }).catch(() => {});
    }
}

// Clics e Interacción
window.addEventListener('click', (event) => {
    startAudio();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactiveSprites);

    if (intersects.length > 0) {
        const clickedId = intersects[0].object.userData.id;
        
        if (clickedId === 'plane') {
            launchAirplane();
        } else if (clickedId === 'danely') {
            showToast("¡Que viva la cumpleañera! 🎉");
        } else if (clickedId === 'cumple') {
            showToast("Espero que la pases super bien hoy y siempre ✨🎂");
        } else if (clickedId === 'date') {
            showToast("26 de Septiembre: ¡Un día muy especial! 🌟");
        }
    }
});

// Bucle de Animación
function animate() {
    requestAnimationFrame(animate);
    
    galaxy.rotation.y += 0.0018;
    textGroup.rotation.y += 0.0025;
    treeGroup.rotation.y -= 0.002;

    const time = Date.now() * 0.0025;
    const pulseScale = 1 + Math.sin(time) * 0.12;
    treeGroup.scale.set(pulseScale, pulseScale, pulseScale);

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Controles de la Carta Modal
const modal = document.getElementById('modal');
document.getElementById('btnOpen').addEventListener('click', () => {
    startAudio();
    triggerConfetti();
    modal.classList.add('active');
});
document.getElementById('btnClose').addEventListener('click', () => modal.classList.remove('active'));
