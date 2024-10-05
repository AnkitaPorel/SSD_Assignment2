import * as THREE from '../node_modules/three/build/three.module.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xFA8072);

const boardSize = 15;
const squareSize = 4.5;
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 75, 50);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 20;
controls.maxDistance = 200;
controls.enableDamping = true;
controls.dampingFactor = 0.05;

let movablePieces = [];
let dice;
const mouseEventLogs = [];

function createBoardSquare(x, z, color, hasBorder = true) {
    const geometry = new THREE.BoxGeometry(squareSize, 0.1, squareSize);
    const material = new THREE.MeshBasicMaterial({ color });
    const square = new THREE.Mesh(geometry, material);
    square.position.set(x, 0, z);
    scene.add(square);

    if (hasBorder) {
        const edges = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
        const line = new THREE.LineSegments(edges, lineMaterial);
        scene.add(line);
        line.position.set(x, 0.05, z);
    }
}

function createPachisiBoard() {
    const neutralColor = 0xffffff;
    const homeColor = 0xff5733;

    for (let row = 6; row <= 8; row++) {
        for (let col = 6; col <= 8; col++) {
            createBoardSquare((col - boardSize / 2) * squareSize, (row - boardSize / 2) * squareSize, homeColor, false);
        }
    }

    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if ((col === 6 || col === 8) && (row >= 0 && row < 6 || row >= 9 && row < 15)) {
                createBoardSquare((col - boardSize / 2) * squareSize, (row - boardSize / 2) * squareSize, neutralColor);
            }
            else if ((row === 6 || row === 8) && (col >= 0 && col < 6 || col >= 9 && col < 15)) {
                createBoardSquare((col - boardSize / 2) * squareSize, (row - boardSize / 2) * squareSize, neutralColor);
            }
            else if ((row === 7 && (col === 0 || col === 14)) || (col === 7 && (row === 0 || row === 14))) {
                createBoardSquare((col - boardSize / 2) * squareSize, (row - boardSize / 2) * squareSize, neutralColor);
            }
        }
    }
    const cornerColors = [0xff0000, 0x0000ff, 0x00ff00, 0xffff00];
    const cornerPositions = [
        [-7, -7],
        [7, -7],
        [-7, 7],
        [7, 7]
    ];

    for (let i = 0; i < cornerPositions.length; i++) {
        const [x, z] = cornerPositions[i];
        createCornerZone(x * squareSize, z * squareSize, cornerColors[i]);
        addPieces(x * squareSize, z * squareSize, cornerColors[i], i);
    }
}

function createDice() {
    const geometry = new THREE.BoxGeometry(7, 7, 7);
    const materials = [
        new THREE.MeshBasicMaterial({ map: createDotsTexture(1) }),
        new THREE.MeshBasicMaterial({ map: createDotsTexture(2) }),
        new THREE.MeshBasicMaterial({ map: createDotsTexture(3) }),
        new THREE.MeshBasicMaterial({ map: createDotsTexture(4) }),
        new THREE.MeshBasicMaterial({ map: createDotsTexture(5) }),
        new THREE.MeshBasicMaterial({ map: createDotsTexture(6) })
    ];
    
    dice = new THREE.Mesh(geometry, materials);
    dice.position.set(50, 0, 0);
    scene.add(dice);

    dice.userData.clickable = true;
    dice.callback = rollDice;
}

function createDotsTexture(number) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 256;
    
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = 'black';
    const dotPositions = getDotPositions(number);
    dotPositions.forEach(pos => {
        context.beginPath();
        context.arc(pos.x, pos.y, 20, 0, Math.PI * 2);
        context.fill();
    });

    return new THREE.CanvasTexture(canvas);
}

function getDotPositions(number) {
    const positions = {
        1: [{ x: 128, y: 128 }],
        2: [{ x: 75, y: 75 }, { x: 181, y: 181 }],
        3: [{ x: 75, y: 75 }, { x: 128, y: 128 }, { x: 181, y: 181 }],
        4: [{ x: 75, y: 75 }, { x: 75, y: 181 }, { x: 181, y: 75 }, { x: 181, y: 181 }],
        5: [{ x: 75, y: 75 }, { x: 75, y: 181 }, { x: 128, y: 128 }, { x: 181, y: 75 }, { x: 181, y: 181 }],
        6: [{ x: 75, y: 75 }, { x: 75, y: 128 }, { x: 75, y: 181 }, { x: 181, y: 75 }, { x: 181, y: 128 }, { x: 181, y: 181 }]
    };
    return positions[number];
}

function rollDice() {
    const randomValue = Math.floor(Math.random() * 6) + 1;

    const rollDuration = 1000;
    const startTime = performance.now();

    function animateRoll(time) {
        const elapsedTime = time - startTime;
        const progress = Math.min(elapsedTime / rollDuration, 1);
        dice.rotation.x += Math.PI * 2 * progress;
        dice.rotation.y += Math.PI * 2 * progress;

        if (progress < 1) {
            requestAnimationFrame(animateRoll);
        } else {
            snapDiceToFace(randomValue);
        }
    }

    requestAnimationFrame(animateRoll);
}

function snapDiceToFace(value) {
    const randomAngleOffset = Math.random() * Math.PI / 6;
    switch (value) {
        case 1: dice.rotation.set(0, 0 + randomAngleOffset, 0); break;
        case 2: dice.rotation.set(0, Math.PI / 2 + randomAngleOffset, 0); break;
        case 3: dice.rotation.set(0, Math.PI + randomAngleOffset, 0); break;
        case 4: dice.rotation.set(0, -Math.PI / 2 + randomAngleOffset, 0); break;
        case 5: dice.rotation.set(0, -Math.PI + randomAngleOffset, 0); break;
        case 6: dice.rotation.set(0, Math.PI / 4 + randomAngleOffset, 0); break;
    }
}

function createCornerZone(x, z, color) {
    const radius = 4.0;
    const circleGeometry = new THREE.CircleGeometry(radius, 32);
    const material = new THREE.MeshBasicMaterial({ color });

    const spacing = radius * 2.0;

    for (let i = -1; i <= 0; i++) {
        for (let j = -1; j <= 0; j++) {
            const circle = new THREE.Mesh(circleGeometry, material);
            circle.position.set(x + i * spacing, 0.05, z + j * spacing);
            circle.rotation.x = -Math.PI / 2;
            scene.add(circle);
        }
    }
}

function addPieces(x, z, color, cornerIndex) {
    const pieceSize = 1.5;
    const pieceHeight = 3;
    const spacing = 4;
    const geometry = new THREE.ConeGeometry(pieceSize, pieceHeight, 32);
    const material = new THREE.MeshPhongMaterial({ color, shininess: 100 });

    for (let i = -1; i <= 0; i++) {
        for (let j = -1; j <= 0; j++) {
            const piece = new THREE.Mesh(geometry, material);
            piece.position.set(x + i * spacing, 1.5, z + j * spacing);
            scene.add(piece);

            if (i === -1 && j === -1) {
                piece.userData.clickable = true;
                piece.color = color;
                piece.callback = movePiece;
                movablePieces.push(piece);
            }
        }
    }
}

function movePiece(piece) {
    const targetPosition = new THREE.Vector3(0, 0, 0);

    const moveDuration = 1000;
    const startPosition = piece.position.clone();
    const startTime = performance.now();

    function animateMove(time) {
        const elapsedTime = time - startTime;
        const progress = Math.min(elapsedTime / moveDuration, 1);
        piece.position.lerpVectors(startPosition, targetPosition, progress);

        if (progress < 1) {
            requestAnimationFrame(animateMove);
        }
    }

    requestAnimationFrame(animateMove);
}

createPachisiBoard();
createDice();

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
window.addEventListener('click', (event) => {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(movablePieces);
    if (intersects.length > 0) {
        const clickedPiece = intersects[0].object;
        if (clickedPiece.callback) {
            clickedPiece.callback(clickedPiece);
        }
    }

    const diceIntersects = raycaster.intersectObject(dice);
    if (diceIntersects.length > 0) {
        if (dice.callback) {
            rollDice();
        }
    }
})

function logMouseEvent(event) {
    const logEntry = {
        type: event.type,
        x: event.clientX,
        y: event.clientY,
        button: event.button,
        timestamp: Date.now()
    };
    mouseEventLogs.push(logEntry);
    console.log(logEntry);
}

window.addEventListener('mousedown', logMouseEvent);
window.addEventListener('mouseup', logMouseEvent);
window.addEventListener('mousemove', logMouseEvent);

function downloadLogs() {
    const blob = new Blob([JSON.stringify(mouseEventLogs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mouse-events-log.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

document.getElementById('download-logs').addEventListener('click', downloadLogs); 