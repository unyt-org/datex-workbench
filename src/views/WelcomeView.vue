<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import * as THREE from 'three';
import { useColorMode } from '@vueuse/core';

const mode = useColorMode();
const containerRef = ref<HTMLElement | null>(null);

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let animationFrameId: number;

// Function to update background color based on theme
const updateBackgroundColor = () => {
    if (!scene) return;

    // Define colors for light and dark modes
    const colors = {
        dark: 0x0a0a0a, // Dark background
        light: 0xf5f5f5, // Light background
    };

    const currentColor = mode.value === 'dark' ? colors.dark : colors.light;
    scene.background = new THREE.Color(currentColor);
};

function init() {
    if (!containerRef.value) return;

    scene = new THREE.Scene();
    updateBackgroundColor(); // Set initial background color

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(40, 40, 85);
    camera.lookAt(40, 40, 1);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.value.appendChild(renderer.domElement);

    const pointsCount = 500;
    const pointsG =
        new THREE.BufferGeometry() as THREE.BufferGeometry<THREE.NormalBufferAttributes>;
    const pointsV = new Float32Array(pointsCount * 3);
    const initialPositions = new Float32Array(pointsCount * 3);

    for (let i = 0; i < pointsCount * 3; i += 3) {
        const x = Math.random() * 80;
        const y = Math.random() * 80;
        const z = Math.random() * 80;

        pointsV[i] = x;
        pointsV[i + 1] = y;
        pointsV[i + 2] = z;

        initialPositions[i] = x;
        initialPositions[i + 1] = y;
        initialPositions[i + 2] = z;
    }

    pointsG.setAttribute('position', new THREE.BufferAttribute(pointsV, 3));

    // Update points color based on theme
    const pointsMaterial = new THREE.PointsMaterial({
        size: 0.1,
        color: mode.value === 'dark' ? 0xffffff : 0x333333,
        transparent: true,
        opacity: 0.8,
    });

    const points = new THREE.Points(pointsG, pointsMaterial);
    scene.add(points);

    const maxConnections = pointsCount * 20;
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(maxConnections * 6);
    const lineColors = new Float32Array(maxConnections * 6);

    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.4,
    });

    const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineSegments);

    let time = 0;
    const speed = 0.05;
    let connectionDistSq = 256;

    function animate() {
        time += 0.005;
        connectionDistSq = Math.min(Math.sin(time) * 256 + 0.5, 256);
        const positions = (pointsG.attributes.position as THREE.BufferAttribute)
            .array as Float32Array;

        for (let i = 0; i < pointsCount * 3; i += 3) {
            positions[i] = initialPositions[i]! + Math.sin(time + i * 0.01) * speed * 10;
            positions[i + 1] = initialPositions[i + 1]! + Math.cos(time + i * 0.02) * speed * 5;
            positions[i + 2] =
                initialPositions[i + 2]! + Math.sin(time * 0.5 + i * 0.03) * speed * 3;
        }

        (pointsG.attributes.position as THREE.BufferAttribute).needsUpdate = true;

        let lineIdx = 0;
        let colorIdx = 0;

        for (let i = 0; i < pointsCount; i++) {
            const ix = positions[i * 3]!;
            const iy = positions[i * 3 + 1]!;
            const iz = positions[i * 3 + 2]!;

            for (let j = i + 1; j < pointsCount; j++) {
                const jx = positions[j * 3]!;
                const jy = positions[j * 3 + 1]!;
                const jz = positions[j * 3 + 2]!;

                const dx = ix - jx;
                const dy = iy - jy;
                const dz = iz - jz;
                const distSq = dx * dx + dy * dy + dz * dz;

                if (distSq < connectionDistSq) {
                    linePositions[lineIdx++] = ix;
                    linePositions[lineIdx++] = iy;
                    linePositions[lineIdx++] = iz;
                    linePositions[lineIdx++] = jx;
                    linePositions[lineIdx++] = jy;
                    linePositions[lineIdx++] = jz;

                    const alpha = 1.0 - distSq / connectionDistSq;

                    for (let k = 0; k < 6; k++) {
                        lineColors[colorIdx++] = alpha;
                    }
                }
            }
        }

        lineGeometry.setDrawRange(0, lineIdx / 3);
        (lineGeometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
        (lineGeometry.attributes.color as THREE.BufferAttribute).needsUpdate = true;

        renderer.render(scene, camera);

        animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', onResize);
}

// Watch for color mode changes and update Three.js
watch(mode, (newMode) => {
    if (!scene) return;

    // Update background color
    updateBackgroundColor();

    // Update points material color
    const pointsMesh = scene.children.find(
        (child: THREE.Object3D) => child instanceof THREE.Points,
    );
    if (pointsMesh && pointsMesh.material instanceof THREE.PointsMaterial) {
        pointsMesh.material.color.setHex(newMode === 'dark' ? 0xffffff : 0x333333);
    }

    // Update line material opacity or color if needed
    const lineMesh = scene.children.find(
        (child: THREE.Object3D) => child instanceof THREE.LineSegments,
    );
    if (lineMesh && lineMesh.material instanceof THREE.LineBasicMaterial) {
        // Optional: Adjust line opacity based on theme
        lineMesh.material.opacity = newMode === 'dark' ? 0.4 : 0.2;
    }
});

function onResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function dispose() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    if (renderer) {
        renderer.dispose();
        if (renderer.domElement && containerRef.value) {
            containerRef.value.removeChild(renderer.domElement);
        }
    }
    window.removeEventListener('resize', onResize);
}

onMounted(() => {
    init();
});

onUnmounted(() => {
    dispose();
});
</script>

<template>
    <div class="fixed inset-0 -z-10">
        <div ref="containerRef" class="absolute inset-0"></div>
    </div>

    <main class="relative z-0"></main>
</template>
