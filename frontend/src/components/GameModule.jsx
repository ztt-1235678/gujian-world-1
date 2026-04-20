import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js';
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js';
import axios from 'axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

// ==========================================
// 营造法式 - 中式建筑营造系统 (高精度仿真版)
// ==========================================

const GameModule = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const composerRef = useRef(null);
  const blocksRef = useRef([]);
  const groundRef = useRef(null); // 地面引用，用于射线检测
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const currentBlockTypeRef = useRef('wood_nanmu');
  const [blockType, setBlockType] = useState('wood_nanmu');
  const [selectedCategory, setSelectedCategory] = useState('all'); // 新增：分类筛选
  const [showHint, setShowHint] = useState(null);
  const [multiplayerRoom, setMultiplayerRoom] = useState(null);
  const socketRef = useRef(null);
  const [timeOfDay, setTimeOfDay] = useState(12);
  const [weather, setWeather] = useState('clear');
  const particlesRef = useRef([]);
  const cloudsRef = useRef([]);
  const sunLightRef = useRef(null);
  const ambientLightRef = useRef(null);
  const hemiLightRef = useRef(null);
  const [toolbarCollapsed, setToolbarCollapsed] = useState(false);
  const lastClickTimeRef = useRef(0);
  const previewMeshRef = useRef(null);
  const materialCache = useRef({});

  // 创建高分辨率纹理
  const createWoodTexture = (baseColor, darkColor, lightColor, grainIntensity = 1, grainType = 'straight') => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 2048);
    gradient.addColorStop(0, baseColor);
    gradient.addColorStop(0.5, lightColor);
    gradient.addColorStop(1, darkColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 2048, 2048);
    
    // 木纹年轮 - 更精细
    ctx.globalCompositeOperation = 'multiply';
    for (let i = 0; i < 200; i++) {
      const y = Math.random() * 2048;
      const width = 20 + Math.random() * 40;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= 2048; x += 5) {
        const noise = Math.sin(x * 0.008 + y * 0.015) * 15 * grainIntensity;
        ctx.lineTo(x, y + noise);
      }
      ctx.lineTo(2048, y + width);
      for (let x = 2048; x >= 0; x -= 5) {
        const noise = Math.sin(x * 0.008 + y * 0.015) * 15 * grainIntensity;
        ctx.lineTo(x, y + width + noise);
      }
      ctx.closePath();
      ctx.fillStyle = `rgba(0,0,0,${0.08 + Math.random() * 0.1})`;
      ctx.fill();
    }
    
    // 木射线
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * 2048;
      const y = Math.random() * 2048;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (Math.random() - 0.5) * 8, y + 15 + Math.random() * 25);
      ctx.strokeStyle = `rgba(255,250,240,${0.15 + Math.random() * 0.25})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    
    ctx.globalCompositeOperation = 'source-over';
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 16;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  };

  // 柱子花纹纹理（龙纹、云纹）
  const createPillarTexture = (pattern = 'dragon') => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');
    
    // 底色
    ctx.fillStyle = '#8B0000';
    ctx.fillRect(0, 0, 1024, 2048);
    
    if (pattern === 'dragon') {
      // 简化龙纹 - 金色盘龙
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 8;
      for (let i = 0; i < 5; i++) {
        const y = i * 400 + 200;
        ctx.beginPath();
        ctx.moveTo(200, y);
        ctx.bezierCurveTo(400, y-100, 600, y+100, 824, y);
        ctx.bezierCurveTo(824, y+50, 700, y+150, 512, y+100);
        ctx.bezierCurveTo(300, y+50, 200, y+100, 200, y);
        ctx.stroke();
        
        // 龙鳞
        for (let j = 0; j < 20; j++) {
          const px = 200 + j * 30;
          const py = y + Math.sin(j * 0.5) * 30;
          ctx.fillStyle = '#D4AF37';
          ctx.beginPath();
          ctx.arc(px, py, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (pattern === 'cloud') {
      // 云纹
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 6;
      for (let i = 0; i < 8; i++) {
        const y = i * 250 + 125;
        for (let j = 0; j < 3; j++) {
          const x = j * 350 + 150;
          ctx.beginPath();
          ctx.arc(x, y, 40, 0, Math.PI, true);
          ctx.arc(x + 80, y - 20, 30, 0, Math.PI, true);
          ctx.arc(x + 140, y, 40, 0, Math.PI, true);
          ctx.stroke();
        }
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 1);
    texture.anisotropy = 16;
    return texture;
  };

  const createStoneTexture = (baseColor, speckColor) => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 2048, 2048);
    
    // 更细致的颗粒
    for (let i = 0; i < 15000; i++) {
      const x = Math.random() * 2048;
      const y = Math.random() * 2048;
      const size = Math.random() * 3;
      ctx.fillStyle = speckColor;
      ctx.globalAlpha = 0.3 + Math.random() * 0.4;
      ctx.fillRect(x, y, size, size);
    }
    
    // 添加石纹
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    for (let i = 0; i < 50; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * 2048, 0);
      ctx.bezierCurveTo(
        Math.random() * 2048, 600,
        Math.random() * 2048, 1200,
        Math.random() * 2048, 2048
      );
      ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 16;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  };

  const createBrickTexture = (brickColor, mortarColor, isGlazed = false) => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = mortarColor;
    ctx.fillRect(0, 0, 2048, 2048);
    
    const brickW = 180;
    const brickH = 90;
    for (let row = 0; row < 23; row++) {
      const offset = (row % 2) * (brickW / 2);
      for (let col = -1; col < 12; col++) {
        const x = col * brickW + offset;
        const y = row * brickH;
        
        // 砖块本体
        ctx.fillStyle = brickColor;
        ctx.fillRect(x + 3, y + 3, brickW - 6, brickH - 6);
        
        // 砖缝阴影
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(x + 3, y + brickH - 6, brickW - 6, 3);
        ctx.fillRect(x + brickW - 6, y + 3, 3, brickH - 6);
        
        if (isGlazed) {
          ctx.fillStyle = 'rgba(255,215,0,0.25)';
          ctx.fillRect(x + 6, y + 6, brickW - 12, brickH - 12);
        }
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    texture.anisotropy = 16;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  };

  const createRoofTexture = (baseColor, isGlazed = false) => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 2048, 2048);
    
    const tileW = 140;
    const tileH = 70;
    for (let row = 0; row < 30; row++) {
      for (let col = 0; col < 15; col++) {
        const x = col * tileW;
        const y = row * tileH;
        
        // 瓦当阴影
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(x + 2, y + 2, tileW - 4, tileH - 4);
        
        // 瓦面高光
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(x + 8, y + 8, tileW - 16, 15);
        
        if (isGlazed) {
          ctx.fillStyle = 'rgba(255,255,200,0.3)';
          ctx.fillRect(x + 10, y + 10, tileW - 20, tileH - 20);
        }
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    texture.anisotropy = 16;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  };

  const createLeafTexture = (leafColor) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = leafColor;
    ctx.fillRect(0, 0, 512, 512);
    
    // 叶脉
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(256, 512);
    ctx.lineTo(256, 50);
    ctx.stroke();
    
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      ctx.moveTo(256, 100 + i * 40);
      ctx.lineTo(100, 150 + i * 35);
      ctx.moveTo(256, 100 + i * 40);
      ctx.lineTo(412, 150 + i * 35);
      ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  };

  const createWindowTexture = (pattern = 'haitang') => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(245,245,220,0.3)';
    ctx.fillRect(0, 0, 1024, 1024);
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 20;
    
    if (pattern === 'haitang') {
      const cols = 3, rows = 3;
      const cellW = 1024 / cols, cellH = 1024 / rows;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const cx = i * cellW + cellW/2;
          const cy = j * cellH + cellH/2;
          for (let p = 0; p < 4; p++) {
            const angle = (p * Math.PI / 2) - Math.PI/4;
            const px = cx + Math.cos(angle) * 100;
            const py = cy + Math.sin(angle) * 100;
            ctx.beginPath();
            ctx.ellipse(px, py, 40, 80, angle + Math.PI/2, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.beginPath();
          ctx.moveTo(cx - 40, cy);
          ctx.lineTo(cx + 40, cy);
          ctx.moveTo(cx, cy - 40);
          ctx.lineTo(cx, cy + 40);
          ctx.stroke();
        }
      }
    } else {
      for (let i = 0; i < 80; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * 1024, Math.random() * 1024);
        ctx.lineTo(Math.random() * 1024, Math.random() * 1024);
        ctx.stroke();
      }
    }
    ctx.strokeRect(30, 30, 964, 964);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  };

  const adjustColor = (color, amount) => {
    const num = parseInt(color.replace("#",""),16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  };

  // 建材库 - 移除石狮，添加仿真植物和柱子
  const blockData = useMemo(() => ({
    // 木材类
    wood_nanmu: { name: '金丝楠木', category: 'wood', subcategory: 'precious', hint: '皇家御用金丝楠木', color: '#D4AF37', roughness: 0.25, metalness: 0.05 },
    wood_zitan: { name: '小叶紫檀', category: 'wood', subcategory: 'precious', hint: '木中极品，牛毛纹金星', color: '#4A0404', roughness: 0.2, metalness: 0.1 },
    wood_huanghuali: { name: '黄花梨', category: 'wood', subcategory: 'precious', hint: '木纹如行云流水', color: '#D2691E', roughness: 0.3, metalness: 0.03 },
    wood_chengnan: { name: '城楠木', category: 'wood', subcategory: 'structural', hint: '营造法式大木作主材', color: '#8B6914', roughness: 0.35, metalness: 0.0 },
    wood_tieli: { name: '铁力木', category: 'wood', subcategory: 'structural', hint: '坚硬如铁，承重极佳', color: '#3D2817', roughness: 0.45, metalness: 0.0 },
    
    // 柱子类（新增）
    pillar_dragon: { name: '龙柱', category: 'pillar', subcategory: 'carved', hint: '盘龙纹雕柱', color: '#8B0000', roughness: 0.3, metalness: 0.1 },
    pillar_cloud: { name: '云纹柱', category: 'pillar', subcategory: 'carved', hint: '祥云纹雕柱', color: '#8B4513', roughness: 0.35, metalness: 0.05 },
    pillar_plain: { name: '光面柱', category: 'pillar', subcategory: 'plain', hint: '素面圆柱', color: '#8B4513', roughness: 0.4, metalness: 0.0 },
    
    // 斗拱类
    dougong_cai: { name: '斗拱材', category: 'dougong', hint: '宋式斗拱，七铺作', color: '#2F4F4F', roughness: 0.35, metalness: 0.05 },
    
    // 石材类
    stone_hanbaiyu: { name: '汉白玉', category: 'stone', subcategory: 'precious', hint: '洁白如玉，皇家御用', color: '#F5F5F5', roughness: 0.15, metalness: 0.0 },
    stone_qingshi: { name: '青石', category: 'stone', subcategory: 'common', hint: '质地细密，园林铺地', color: '#5F9EA0', roughness: 0.55, metalness: 0.0 },
    stone_huagang: { name: '花岗岩', category: 'stone', subcategory: 'common', hint: '坚硬耐磨', color: '#708090', roughness: 0.65, metalness: 0.03 },
    stone_danbi: { name: '丹陛石', category: 'stone', subcategory: 'decorative', hint: '御路石雕', color: '#D4AF37', roughness: 0.25, metalness: 0.05 },
    
    // 瓦作类
    roof_qingwa: { name: '青瓦', category: 'roof', subcategory: 'common', hint: '粘土烧制', color: '#2F4F4F', roughness: 0.75, metalness: 0.0 },
    roof_liuli: { name: '琉璃瓦', category: 'roof', subcategory: 'imperial', hint: '皇家专用', color: '#DAA520', roughness: 0.08, metalness: 0.2 },
    roof_wa_dang: { name: '瓦当', category: 'roof', subcategory: 'decorative', hint: '滴水瓦当', color: '#8B4513', roughness: 0.55, metalness: 0.0 },
    
    // 砖作类
    brick_jinzhuan: { name: '金砖', category: 'brick', subcategory: 'imperial', hint: '御窑烧制', color: '#8B4513', roughness: 0.15, metalness: 0.0 },
    brick_zhuhong: { name: '朱红墙', category: 'brick', subcategory: 'common', hint: '宫墙红', color: '#B22222', roughness: 0.65, metalness: 0.0 },
    brick_huiqiang: { name: '徽派马头墙', category: 'brick', subcategory: 'regional', hint: '白墙黛瓦', color: '#F5F5DC', roughness: 0.75, metalness: 0.0 },
    
    // 装修类
    window_haitang: { name: '海棠纹窗', category: 'window', pattern: 'haitang', hint: '四瓣海棠', color: '#8B4513', roughness: 0.35, metalness: 0.0, transparent: true, opacity: 0.7 },
    window_binglie: { name: '冰裂纹窗', category: 'window', pattern: 'binglie', hint: '冰裂纹理', color: '#A0522D', roughness: 0.35, metalness: 0.0, transparent: true, opacity: 0.6 },
    door_zhuqi: { name: '朱漆大门', category: 'door', subcategory: 'main', hint: '朱门铜钉', color: '#8B0000', roughness: 0.25, metalness: 0.15 },
    door_chuaima: { name: '垂花门', category: 'door', subcategory: 'decorative', hint: '垂莲柱雕', color: '#D2691E', roughness: 0.35, metalness: 0.08 },
    
    // 植物类（新增，替换石狮）
    plant_pine: { name: '苍松', category: 'plant', subcategory: 'tree', hint: '迎客松，四季常青', color: '#0F5132', roughness: 0.8, metalness: 0.0 },
    plant_bamboo: { name: '翠竹', category: 'plant', subcategory: 'tree', hint: '节节高升，君子之风', color: '#228B22', roughness: 0.6, metalness: 0.0 },
    plant_plum: { name: '梅树', category: 'plant', subcategory: 'tree', hint: '凌寒独自开', color: '#8B0000', roughness: 0.7, metalness: 0.0 },
    plant_lotus: { name: '荷花', category: 'plant', subcategory: 'flower', hint: '出淤泥而不染', color: '#FFB6C1', roughness: 0.5, metalness: 0.0 },
    plant_bonsai: { name: '盆景松', category: 'plant', subcategory: 'decor', hint: '咫尺千里，方寸乾坤', color: '#2F4F4F', roughness: 0.8, metalness: 0.0 },
    grass_patch: { name: '草坪', category: 'plant', subcategory: 'ground', hint: '绿意盎然', color: '#7CFC00', roughness: 0.9, metalness: 0.0 },
    
    // 装饰类（移除石狮，保留其他）
    lantern_gong: { name: '宫灯', category: 'decor', subcategory: 'lighting', hint: '六角龙头', color: '#FFD700', roughness: 0.15, metalness: 0.3, emissive: 0xFFD700, emissiveIntensity: 0.6 },
    lantern_palace: { name: '气死风灯', category: 'decor', subcategory: 'lighting', hint: '长圆筒形', color: '#FF4500', roughness: 0.25, metalness: 0.08, emissive: 0xFF4500, emissiveIntensity: 0.5 },
    bixi_stele: { name: '赑屃驮碑', category: 'decor', subcategory: 'monument', hint: '龙生九子', color: '#696969', roughness: 0.55, metalness: 0.0 },
    planter_porcelain: { name: '青花瓷盆', category: 'decor', subcategory: 'garden', hint: '白地蓝花', color: '#4169E1', roughness: 0.08, metalness: 0.05 },
    taihu_stone: { name: '太湖石', category: 'decor', subcategory: 'garden', hint: '瘦皱漏透', color: '#D3D3D3', roughness: 0.85, metalness: 0.0 }
  }), []);

  // 生成纹理缓存
  const textures = useMemo(() => {
    const texMap = {};
    Object.keys(blockData).forEach(key => {
      const info = blockData[key];
      if (info.category === 'wood') {
        texMap[key] = createWoodTexture(info.color, adjustColor(info.color, -40), adjustColor(info.color, 40));
      } else if (info.category === 'pillar') {
        if (key === 'pillar_dragon') texMap[key] = createPillarTexture('dragon');
        else if (key === 'pillar_cloud') texMap[key] = createPillarTexture('cloud');
        else texMap[key] = createWoodTexture(info.color, adjustColor(info.color, -30), adjustColor(info.color, 30));
      } else if (info.category === 'stone') {
        texMap[key] = createStoneTexture(info.color, '#2F4F4F');
      } else if (info.category === 'brick') {
        texMap[key] = createBrickTexture(info.color, adjustColor(info.color, -20), key === 'brick_jinzhuan');
      } else if (info.category === 'roof') {
        texMap[key] = createRoofTexture(info.color, key === 'roof_liuli');
      } else if (info.category === 'window') {
        texMap[key] = createWindowTexture(info.pattern);
      }
    });
    return texMap;
  }, [blockData]);

  // 分类定义
  const categories = [
    { key: 'all', label: '全部', icon: '🏛️' },
    { key: 'wood', label: '木材', icon: '🪵' },
    { key: 'pillar', label: '柱类', icon: '🏛️' },
    { key: 'dougong', label: '斗拱', icon: '⛩️' },
    { key: 'stone', label: '石作', icon: '🪨' },
    { key: 'roof', label: '瓦作', icon: '🏯' },
    { key: 'brick', label: '砖作', icon: '🧱' },
    { key: 'window', label: '装修', icon: '🪟' },
    { key: 'plant', label: '园林', icon: '🌿' },
    { key: 'decor', label: '装饰', icon: '🏮' }
  ];

  // 根据分类筛选方块
  const filteredBlocks = useMemo(() => {
    if (selectedCategory === 'all') {
      return Object.entries(blockData);
    }
    return Object.entries(blockData).filter(([_, info]) => info.category === selectedCategory || info.subcategory === selectedCategory);
  }, [blockData, selectedCategory]);

  // 优化几何体缓存
  const getBoxGeometry = useCallback(() => {
    if (!window._sharedBoxGeo) {
      const geo = new THREE.BoxGeometry(0.98, 0.98, 0.98, 2, 2, 2);
      const posAttr = geo.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        const x = posAttr.getX(i);
        const y = posAttr.getY(i);
        const z = posAttr.getZ(i);
        const factor = 0.985;
        posAttr.setXYZ(i, x * factor, y * factor, z * factor);
      }
      geo.computeVertexNormals();
      window._sharedBoxGeo = geo;
    }
    return window._sharedBoxGeo;
  }, []);

  // 高精度斗拱模型 - 按照宋《营造法式》制式
  const createDougong = (material) => {
    const group = new THREE.Group();
    
    // 1. 坐斗（大斗）- 底部大斗
    const douGeo = new THREE.BoxGeometry(0.8, 0.4, 0.8);
    const dou = new THREE.Mesh(douGeo, material);
    dou.position.y = 0.2;
    dou.castShadow = true;
    group.add(dou);
    
    // 2. 华拱（向前出跳）- 主要出挑构件
    const huaGongLength = 1.8;
    const huaGongGeo = new THREE.BoxGeometry(0.35, 0.3, huaGongLength);
    const huaGong = new THREE.Mesh(huaGongGeo, material);
    huaGong.position.set(0, 0.55, huaGongLength/2 - 0.2);
    huaGong.castShadow = true;
    group.add(huaGong);
    
    // 3. 泥道拱（横向，与华拱垂直）- 长向拱
    const niDaoGongLength = 1.6;
    const niDaoGongGeo = new THREE.BoxGeometry(niDaoGongLength, 0.28, 0.35);
    const niDaoGong = new THREE.Mesh(niDaoGongGeo, material);
    niDaoGong.position.set(0, 0.55, 0);
    niDaoGong.castShadow = true;
    group.add(niDaoGong);
    
    // 4. 交互斗（小斗）- 位于华拱和泥道拱交叉处
    const jiaoDouGeo = new THREE.BoxGeometry(0.35, 0.25, 0.35);
    const jiaoDou = new THREE.Mesh(jiaoDouGeo, material);
    jiaoDou.position.set(0, 0.82, 0);
    jiaoDou.castShadow = true;
    group.add(jiaoDou);
    
    // 5. 瓜子拱（横向，位于华拱之上）- 第二层横拱
    const guaZiGongGeo = new THREE.BoxGeometry(1.4, 0.25, 0.3);
    const guaZiGong = new THREE.Mesh(guaZiGongGeo, material);
    guaZiGong.position.set(0, 0.95, 0.4);
    guaZiGong.castShadow = true;
    group.add(guaZiGong);
    
    // 6. 令拱（最上层横拱）
    const lingGongGeo = new THREE.BoxGeometry(1.2, 0.25, 0.3);
    const lingGong = new THREE.Mesh(lingGongGeo, material);
    lingGong.position.set(0, 1.2, 0.6);
    lingGong.castShadow = true;
    group.add(lingGong);
    
    // 7. 耍头（华拱端头垂直构件）
    const shuaTouGeo = new THREE.BoxGeometry(0.3, 0.4, 0.3);
    const shuaTou = new THREE.Mesh(shuaTouGeo, material);
    shuaTou.position.set(0, 1.1, 1.4);
    shuaTou.castShadow = true;
    group.add(shuaTou);
    
    // 8. 散斗（小斗，位于各拱端部）
    const sanDouGeo = new THREE.BoxGeometry(0.25, 0.2, 0.25);
    const positions = [
      [-0.7, 0.68, 0], [0.7, 0.68, 0], // 泥道拱两端
      [-0.6, 1.08, 0.4], [0.6, 1.08, 0.4], // 瓜子拱两端
      [-0.5, 1.33, 0.6], [0.5, 1.33, 0.6], // 令拱两端
    ];
    positions.forEach(pos => {
      const sanDou = new THREE.Mesh(sanDouGeo, material);
      sanDou.position.set(...pos);
      sanDou.castShadow = true;
      group.add(sanDou);
    });
    
    // 9. 昂（斜向下，装饰性）
    const angGeo = new THREE.BoxGeometry(0.25, 0.15, 0.8);
    const ang = new THREE.Mesh(angGeo, material);
    ang.rotation.x = Math.PI / 6;
    ang.position.set(0, 0.9, 1.0);
    ang.castShadow = true;
    group.add(ang);
    
    return group;
  };

  // 植物模型生成器
  const createPlant = (type) => {
    const group = new THREE.Group();
    
    if (type === 'plant_pine') {
      // 苍松 - 多层锥形树冠
      const trunkMat = new THREE.MeshStandardMaterial({ color: '#4A3728', roughness: 0.9 });
      const trunkGeo = new THREE.CylinderGeometry(0.25, 0.35, 2.5, 8);
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 1.25;
      trunk.castShadow = true;
      group.add(trunk);
      
      const leafMat = new THREE.MeshStandardMaterial({ 
        color: '#0F5132', 
        roughness: 0.8,
        map: createLeafTexture('#0F5132')
      });
      
      // 多层树冠
      const layers = [
        { y: 3.5, r: 1.8, h: 1.5 },
        { y: 4.5, r: 1.4, h: 1.2 },
        { y: 5.2, r: 1.0, h: 1.0 },
        { y: 5.8, r: 0.6, h: 0.8 }
      ];
      
      layers.forEach(layer => {
        const geo = new THREE.ConeGeometry(layer.r, layer.h, 8);
        const mesh = new THREE.Mesh(geo, leafMat);
        mesh.position.y = layer.y;
        mesh.castShadow = true;
        group.add(mesh);
      });
      
      // 松针细节
      for (let i = 0; i < 30; i++) {
        const needleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 4);
        const needle = new THREE.Mesh(needleGeo, leafMat);
        const angle = Math.random() * Math.PI * 2;
        const radius = 1 + Math.random() * 0.5;
        needle.position.set(
          Math.cos(angle) * radius,
          3 + Math.random() * 2,
          Math.sin(angle) * radius
        );
        needle.rotation.x = (Math.random() - 0.5) * 0.5;
        needle.rotation.z = (Math.random() - 0.5) * 0.5;
        group.add(needle);
      }
    } 
    else if (type === 'plant_bamboo') {
      // 翠竹 - 竹节分明
      const bambooMat = new THREE.MeshStandardMaterial({ color: '#228B22', roughness: 0.4 });
      const nodeMat = new THREE.MeshStandardMaterial({ color: '#1a6b1a', roughness: 0.5 });
      
      const segments = 6;
      const segHeight = 0.6;
      
      for (let i = 0; i < segments; i++) {
        // 竹段
        const geo = new THREE.CylinderGeometry(0.12, 0.15, segHeight, 8);
        const mesh = new THREE.Mesh(geo, bambooMat);
        mesh.position.y = 0.3 + i * segHeight;
        mesh.castShadow = true;
        group.add(mesh);
        
        // 竹节（突出的环）
        const nodeGeo = new THREE.TorusGeometry(0.13, 0.03, 6, 8);
        const node = new THREE.Mesh(nodeGeo, nodeMat);
        node.rotation.x = Math.PI / 2;
        node.position.y = 0.3 + i * segHeight + segHeight/2;
        group.add(node);
      }
      
      // 竹叶 - 片状
      const leafMat = new THREE.MeshStandardMaterial({ 
        color: '#32CD32', 
        roughness: 0.6,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9
      });
      
      for (let i = 0; i < 20; i++) {
        const leafGeo = new THREE.PlaneGeometry(0.15, 0.8);
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        const angle = Math.random() * Math.PI * 2;
        leaf.position.set(
          Math.cos(angle) * 0.3,
          3.5 + Math.random() * 0.5,
          Math.sin(angle) * 0.3
        );
        leaf.rotation.set(
          Math.random() * 0.5,
          angle,
          Math.random() * 0.3
        );
        group.add(leaf);
      }
    }
    else if (type === 'plant_plum') {
      // 梅树 - 曲折枝干 + 红花
      const trunkMat = new THREE.MeshStandardMaterial({ color: '#3D2817', roughness: 0.9 });
      const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 2, 6);
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 1;
      group.add(trunk);
      
      // 分枝
      for (let i = 0; i < 4; i++) {
        const branchGeo = new THREE.CylinderGeometry(0.08, 0.12, 1.2, 6);
        const branch = new THREE.Mesh(branchGeo, trunkMat);
        const angle = (i / 4) * Math.PI * 2;
        branch.position.set(
          Math.cos(angle) * 0.8,
          2 + Math.random() * 0.5,
          Math.sin(angle) * 0.8
        );
        branch.rotation.z = Math.cos(angle) * 0.4;
        branch.rotation.x = Math.sin(angle) * 0.4;
        group.add(branch);
      }
      
      // 梅花 - 小红球簇
      const flowerMat = new THREE.MeshStandardMaterial({ color: '#DC143C', roughness: 0.5 });
      for (let i = 0; i < 50; i++) {
        const flowerGeo = new THREE.SphereGeometry(0.08, 6, 6);
        const flower = new THREE.Mesh(flowerGeo, flowerMat);
        const angle = Math.random() * Math.PI * 2;
        const r = 0.5 + Math.random() * 1.2;
        flower.position.set(
          Math.cos(angle) * r,
          2 + Math.random() * 1.5,
          Math.sin(angle) * r
        );
        group.add(flower);
      }
    }
    else if (type === 'plant_lotus') {
      // 荷花 - 圆形叶片 + 花朵
      const leafMat = new THREE.MeshStandardMaterial({ 
        color: '#228B22', 
        roughness: 0.6,
        side: THREE.DoubleSide
      });
      
      // 荷叶 - 圆形带缺口
      const leafGeo = new THREE.CircleGeometry(0.8, 16, 0, Math.PI * 1.8);
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.rotation.x = -Math.PI / 2;
      leaf.position.y = 0.1;
      leaf.castShadow = true;
      group.add(leaf);
      
      // 叶柄
      const stemGeo = new THREE.CylinderGeometry(0.05, 0.08, 1.5, 6);
      const stem = new THREE.Mesh(stemGeo, leafMat);
      stem.position.y = 0.75;
      group.add(stem);
      
      // 荷花
      const flowerGroup = new THREE.Group();
      const petalMat = new THREE.MeshStandardMaterial({ 
        color: '#FFB6C1', 
        roughness: 0.4,
        side: THREE.DoubleSide
      });
      
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const petalGeo = new THREE.SphereGeometry(0.25, 8, 8);
        petalGeo.scale(0.6, 1, 0.3);
        const petal = new THREE.Mesh(petalGeo, petalMat);
        petal.position.set(
          Math.cos(angle) * 0.25,
          1.8,
          Math.sin(angle) * 0.25
        );
        petal.rotation.y = angle;
        petal.rotation.x = 0.3;
        flowerGroup.add(petal);
      }
      group.add(flowerGroup);
    }
    else if (type === 'plant_bonsai') {
      // 盆景松 - 微型造型
      const trunkMat = new THREE.MeshStandardMaterial({ color: '#5C4033', roughness: 0.9 });
      const trunkGeo = new THREE.CylinderGeometry(0.15, 0.25, 1.2, 6);
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 0.6;
      trunk.rotation.z = 0.2;
      group.add(trunk);
      
      const leafMat = new THREE.MeshStandardMaterial({ color: '#2F4F4F', roughness: 0.8 });
      
      // 造型树冠
      const positions = [
        [0.4, 1.2, 0], [-0.3, 1.0, 0.3], [0, 1.5, -0.2]
      ];
      positions.forEach(pos => {
        const geo = new THREE.DodecahedronGeometry(0.4, 0);
        const mesh = new THREE.Mesh(geo, leafMat);
        mesh.position.set(...pos);
        group.add(mesh);
      });
      
      // 盆
      const potGeo = new THREE.BoxGeometry(1.2, 0.4, 0.8);
      const potMat = new THREE.MeshStandardMaterial({ color: '#8B4513', roughness: 0.5 });
      const pot = new THREE.Mesh(potGeo, potMat);
      pot.position.y = 0.2;
      group.add(pot);
    }
    else if (type === 'grass_patch') {
      // 草坪 - 无数小片草
      const grassMat = new THREE.MeshStandardMaterial({ 
        color: '#7CFC00', 
        roughness: 0.9,
        side: THREE.DoubleSide
      });
      
      for (let i = 0; i < 50; i++) {
        const bladeGeo = new THREE.PlaneGeometry(0.1, 0.4);
        const blade = new THREE.Mesh(bladeGeo, grassMat);
        const x = (Math.random() - 0.5) * 1.5;
        const z = (Math.random() - 0.5) * 1.5;
        blade.position.set(x, 0.2, z);
        blade.rotation.y = Math.random() * Math.PI;
        blade.rotation.x = (Math.random() - 0.5) * 0.2;
        group.add(blade);
      }
    }
    
    return group;
  };

  const addBlock = useCallback((scene, x, y, z, type, fromMultiplayer = false, rotation = 0) => {
    const info = blockData[type];
    if (!info || !scene) return null;
    
    let mesh;
    const texture = textures[type];
    
    // 基础方块类（木、石、砖）
    if (['wood', 'stone', 'brick'].includes(info.category)) {
      const geometry = getBoxGeometry();
      let matKey = `${type}_mat`;
      if (!materialCache.current[matKey]) {
        materialCache.current[matKey] = new THREE.MeshStandardMaterial({ 
          map: texture,
          roughness: info.roughness || 0.4,
          metalness: info.metalness || 0.0,
          bumpMap: texture,
          bumpScale: 0.02,
          envMapIntensity: 0.5
        });
      }
      mesh = new THREE.Mesh(geometry, materialCache.current[matKey]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
    // 柱子类（圆柱体）
    else if (info.category === 'pillar') {
      const geometry = new THREE.CylinderGeometry(0.4, 0.4, 1, 16);
      let matKey = `${type}_mat`;
      if (!materialCache.current[matKey]) {
        materialCache.current[matKey] = new THREE.MeshStandardMaterial({
          map: texture,
          roughness: info.roughness,
          metalness: info.metalness
        });
      }
      mesh = new THREE.Mesh(geometry, materialCache.current[matKey]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
    // 斗拱（高精度模型）
    else if (info.category === 'dougong') {
      const mat = new THREE.MeshStandardMaterial({ 
        map: texture, 
        color: info.color, 
        roughness: 0.35, 
        metalness: 0.05 
      });
      mesh = createDougong(mat);
    }
    // 植物
    else if (info.category === 'plant') {
      mesh = createPlant(type);
    }
    // 窗户
    else if (info.category === 'window') {
      const group = new THREE.Group();
      const frameMat = new THREE.MeshStandardMaterial({ color: '#5C4033', roughness: 0.4 });
      const frameGeo = new THREE.BoxGeometry(1.0, 1.25, 0.12);
      const frame = new THREE.Mesh(frameGeo, frameMat);
      frame.castShadow = true;
      group.add(frame);
      
      const coreMat = new THREE.MeshStandardMaterial({ 
        map: texture, 
        transparent: info.transparent || false, 
        opacity: info.opacity || 1.0, 
        side: THREE.DoubleSide, 
        alphaTest: 0.1 
      });
      const coreGeo = new THREE.PlaneGeometry(0.9, 1.15);
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.position.z = 0.02;
      group.add(core);
      mesh = group;
    }
    // 门
    else if (info.category === 'door') {
      const group = new THREE.Group();
      const doorMat = new THREE.MeshStandardMaterial({ map: texture, roughness: info.roughness, metalness: info.metalness });
      const doorGeo = new THREE.BoxGeometry(1.05, 2.1, 0.18);
      const door = new THREE.Mesh(doorGeo, doorMat);
      door.castShadow = true;
      group.add(door);
      
      const nailMat = new THREE.MeshStandardMaterial({ color: '#D4AF37', metalness: 0.8 });
      const nailGeo = new THREE.SphereGeometry(0.04, 8, 8);
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          const nail = new THREE.Mesh(nailGeo, nailMat);
          nail.position.set((col - 2) * 0.18, (row - 2) * 0.35 + 0.2, 0.1);
          group.add(nail);
        }
      }
      mesh = group;
    }
    // 屋顶
    else if (info.category === 'roof') {
      const tileGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.98, 24, 1, false, 0, Math.PI);
      const mat = new THREE.MeshStandardMaterial({ map: texture, roughness: info.roughness, metalness: info.metalness });
      mesh = new THREE.Mesh(tileGeo, mat);
      mesh.rotation.z = Math.PI / 2;
      mesh.castShadow = true;
    }
    // 装饰类（移除石狮后的其他装饰）
    else if (info.category === 'decor') {
      if (type.includes('lantern')) {
        const group = new THREE.Group();
        const shadeMat = new THREE.MeshStandardMaterial({ 
          color: info.color, 
          emissive: info.emissive || 0, 
          emissiveIntensity: info.emissiveIntensity || 0, 
          transparent: true, 
          opacity: 0.85,
          side: THREE.DoubleSide
        });
        const shadeGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.9, 8, 1, true);
        const shade = new THREE.Mesh(shadeGeo, shadeMat);
        group.add(shade);
        
        const topMat = new THREE.MeshStandardMaterial({ color: '#8B0000' });
        const topGeo = new THREE.ConeGeometry(0.45, 0.2, 8);
        const top = new THREE.Mesh(topGeo, topMat);
        top.position.y = 0.55;
        group.add(top);
        
        const light = new THREE.PointLight(0xFFD700, 1.5, 12);
        light.position.set(0, 0, 0);
        group.add(light);
        mesh = group;
      } else if (type === 'bixi_stele') {
        // 赑屃（龟形底座）
        const group = new THREE.Group();
        const bixiMat = new THREE.MeshStandardMaterial({ color: info.color, roughness: 0.6 });
        
        // 龟身
        const bodyGeo = new THREE.BoxGeometry(1.2, 0.5, 1.8);
        const body = new THREE.Mesh(bodyGeo, bixiMat);
        body.position.y = 0.25;
        body.castShadow = true;
        group.add(body);
        
        // 龟头
        const headGeo = new THREE.BoxGeometry(0.5, 0.4, 0.6);
        const head = new THREE.Mesh(headGeo, bixiMat);
        head.position.set(0, 0.45, 1.0);
        group.add(head);
        
        // 龟足
        const legGeo = new THREE.BoxGeometry(0.25, 0.3, 0.25);
        [[-0.4, 0.4], [0.4, 0.4], [-0.4, -0.4], [0.4, -0.4]].forEach(pos => {
          const leg = new THREE.Mesh(legGeo, bixiMat);
          leg.position.set(pos[0] * 1.2, 0.15, pos[1] * 1.2);
          group.add(leg);
        });
        
        // 石碑
        const steleGeo = new THREE.BoxGeometry(0.8, 2.0, 0.3);
        const stele = new THREE.Mesh(steleGeo, bixiMat);
        stele.position.set(0, 1.25, 0.2);
        stele.castShadow = true;
        group.add(stele);
        
        mesh = group;
      } else if (type === 'taihu_stone') {
        // 保持原有太湖石样式（瘦皱漏透）
        const geometry = new THREE.DodecahedronGeometry(0.7, 2);
        const simplex = new SimplexNoise();
        const posAttr = geometry.attributes.position;
        for (let i = 0; i < posAttr.count; i++) {
          const x = posAttr.getX(i);
          const y = posAttr.getY(i);
          const z = posAttr.getZ(i);
          const noise = simplex.noise3d(x * 2, y * 2, z * 2) * 0.3;
          const scale = 1 + noise;
          posAttr.setXYZ(i, x * scale, y * scale, z * scale);
        }
        geometry.computeVertexNormals();
        const mat = new THREE.MeshStandardMaterial({ color: info.color, roughness: 0.9 });
        mesh = new THREE.Mesh(geometry, mat);
        mesh.castShadow = true;
      } else {
        const geometry = getBoxGeometry();
        const mat = new THREE.MeshStandardMaterial({ color: info.color });
        mesh = new THREE.Mesh(geometry, mat);
        mesh.castShadow = true;
      }
    }
    else {
      const geometry = getBoxGeometry();
      const mat = new THREE.MeshStandardMaterial({ color: info.color });
      mesh = new THREE.Mesh(geometry, mat);
      mesh.castShadow = true;
    }
    
    mesh.position.set(x, y, z);
    if (rotation) mesh.rotation.y = rotation;
    mesh.userData = { type, name: info.name, category: info.category };
    
    scene.add(mesh);
    blocksRef.current.push(mesh);
    
    // 放置动画
    if (!fromMultiplayer) {
      mesh.scale.set(0, 0, 0);
      let scale = 0;
      const animate = () => {
        scale += 0.12;
        if (scale < 1) {
          mesh.scale.set(scale, scale, scale);
          requestAnimationFrame(animate);
        } else {
          mesh.scale.set(1, 1, 1);
        }
      };
      animate();
    }
    
    if (!fromMultiplayer && socketRef.current && multiplayerRoom) {
      socketRef.current.emit('place-block', { roomId: multiplayerRoom, x, y, z, type, rotation });
    }
    
    return mesh;
  }, [multiplayerRoom, textures, blockData, getBoxGeometry]);

  const removeBlock = useCallback((scene, block, fromMultiplayer = false) => {
    if (!block || !scene) return;
    let scale = 1;
    const animate = () => {
      scale -= 0.15;
      if (scale > 0) {
        block.scale.set(scale, scale, scale);
        requestAnimationFrame(animate);
      } else {
        scene.remove(block);
        const idx = blocksRef.current.indexOf(block);
        if (idx !== -1) blocksRef.current.splice(idx, 1);
        // 清理几何体和材质
        block.traverse((child) => {
          if (child.isMesh) {
            if (child.geometry && child.geometry !== window._sharedBoxGeo) {
              child.geometry.dispose();
            }
          }
        });
      }
    };
    animate();
    
    if (!fromMultiplayer && socketRef.current && multiplayerRoom) {
      socketRef.current.emit('remove-block', { 
        roomId: multiplayerRoom, 
        x: block.position.x, 
        y: block.position.y, 
        z: block.position.z 
      });
    }
  }, [multiplayerRoom]);

  // 预制建筑（适配新系统）
  const buildPavilionWudian = useCallback((x, z, size = 3) => {
    const scene = sceneRef.current;
    const height = size + 1;
    
    // 台基
    for (let layer = 0; layer < 3; layer++) {
      const range = size + 1 - layer * 0.3;
      for (let ix = -Math.ceil(range); ix <= Math.ceil(range); ix++) {
        for (let iz = -Math.ceil(range); iz <= Math.ceil(range); iz++) {
          if (Math.abs(ix) > range || Math.abs(iz) > range) continue;
          addBlock(scene, x + ix, layer * 0.3, z + iz, 'stone_hanbaiyu');
        }
      }
    }
    
    // 柱子（使用龙柱或光面柱）
    const pillarPos = [[-size, -size], [size, -size], [-size, size], [size, size], 
                      [0, -size], [0, size], [-size, 0], [size, 0]];
    pillarPos.forEach((pos, idx) => {
      const isCorner = idx < 4;
      const pillarType = isCorner ? 'pillar_dragon' : 'pillar_plain';
      for (let y = 1; y <= height; y++) {
        addBlock(scene, x + pos[0], y + 0.5, z + pos[1], pillarType);
      }
    });
    
    // 阑额（连接柱子的横向木）
    for (let i = -size; i <= size; i++) {
      addBlock(scene, x + i, height + 0.5, z - size, 'wood_chengnan');
      addBlock(scene, x + i, height + 0.5, z + size, 'wood_chengnan');
      addBlock(scene, x - size, height + 0.5, z + i, 'wood_chengnan');
      addBlock(scene, x + size, height + 0.5, z + i, 'wood_chengnan');
    }
    
    // 斗拱层
    pillarPos.forEach(pos => addBlock(scene, x + pos[0], height + 1.5, z + pos[1], 'dougong_cai'));
    
    // 屋顶
    for (let layer = 0; layer < size + 1; layer++) {
      const y = height + 2.5 + layer * 0.8;
      const range = size - layer * 0.8;
      for (let ix = -Math.ceil(range); ix <= Math.ceil(range); ix++) {
        for (let iz = -Math.ceil(range); iz <= Math.ceil(range); iz++) {
          if (Math.abs(ix) >= range || Math.abs(iz) >= range) {
            addBlock(scene, x + ix, y, z + iz, 'roof_liuli');
          }
        }
      }
    }
    
    // 装饰
    addBlock(scene, x, height + 0.5, z - size - 0.8, 'lantern_gong');
    addBlock(scene, x - size - 0.8, height + 0.5, z, 'lantern_gong');
    addBlock(scene, x + size + 0.8, height + 0.5, z, 'lantern_gong');
    addBlock(scene, x, height + 0.5, z + size + 0.8, 'lantern_gong');
    
    // 添加植物装饰
    addBlock(scene, x - size - 2, 0.5, z - size - 2, 'plant_pine');
    addBlock(scene, x + size + 2, 0.5, z + size + 2, 'plant_bamboo');
  }, [addBlock]);

  const buildMoonGate = useCallback((x, z) => {
    const scene = sceneRef.current;
    for (let i = -3; i <= 3; i++) {
      for (let j = 0; j < 4; j++) {
        if (Math.abs(i) > 1 || j > 1) addBlock(scene, x + i, j + 0.5, z, 'brick_zhuhong');
      }
    }
    for (let i = -2; i <= 2; i++) addBlock(scene, x + i, 4.5, z, 'wood_huanghuali');
    addBlock(scene, x - 1, 3.5, z + 0.3, 'stone_danbi');
    addBlock(scene, x + 1, 3.5, z + 0.3, 'stone_danbi');
    addBlock(scene, x - 2, 0.5, z + 0.6, 'stone_qingshi');
    addBlock(scene, x + 2, 0.5, z + 0.6, 'stone_qingshi');
    
    // 添加盆景
    addBlock(scene, x - 3, 0.5, z + 1, 'plant_bonsai');
    addBlock(scene, x + 3, 0.5, z + 1, 'plant_bonsai');
  }, [addBlock]);

  const buildRockery = useCallback((x, z) => {
    const scene = sceneRef.current;
    const positions = [[0,0,0], [1,0,0], [-1,0,0], [0,0,1], [0,0,-1], 
                      [0.5,0.5,0.5], [-0.5,0.8,-0.5], [0,1.2,0], 
                      [1,0.6,1], [-0.8,0.3,0.8], [0.3,1.5,-0.3]];
    positions.forEach(pos => {
      const height = Math.floor(Math.random() * 2) + 1;
      for (let y = 0; y < height; y++) {
        addBlock(scene, x + pos[0], y + 0.5 + pos[1], z + pos[2], 'taihu_stone');
      }
    });
    
    // 添加草木点缀
    addBlock(scene, x + 1.5, 0.5, z + 1.5, 'plant_bamboo');
    addBlock(scene, x - 1.5, 0.5, z - 1.5, 'grass_patch');
  }, [addBlock]);

  // 方块状和片状云朵
  const createClouds = useCallback(() => {
    const scene = sceneRef.current;
    
    for (let i = 0; i < 10; i++) {
      const cloudGroup = new THREE.Group();
      const cloudType = Math.random() > 0.5 ? 'block' : 'sheet';
      
      if (cloudType === 'block') {
        // 方块云 - 多个BoxGeometry组合
        const boxCount = 3 + Math.floor(Math.random() * 4);
        for (let j = 0; j < boxCount; j++) {
          const width = 2 + Math.random() * 2;
          const height = 1 + Math.random() * 1.5;
          const depth = 1.5 + Math.random() * 1.5;
          const geo = new THREE.BoxGeometry(width, height, depth, 2, 2, 2);
          
          // 稍微圆角化
          const pos = geo.attributes.position;
          for (let k = 0; k < pos.count; k++) {
            const x = pos.getX(k);
            const y = pos.getY(k);
            const z = pos.getZ(k);
            // 轻微噪声使边缘不那么锐利
            const noise = (Math.random() - 0.5) * 0.1;
            pos.setXYZ(k, x + noise, y + noise, z + noise);
          }
          geo.computeVertexNormals();
          
          const mat = new THREE.MeshBasicMaterial({ 
            color: 0xffffff, 
            transparent: true, 
            opacity: 0.6 + Math.random() * 0.2,
            depthWrite: false
          });
          const box = new THREE.Mesh(geo, mat);
          box.position.set(
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 1,
            (Math.random() - 0.5) * 3
          );
          cloudGroup.add(box);
        }
      } else {
        // 片状云 - PlaneGeometry层叠
        const sheetCount = 4 + Math.floor(Math.random() * 3);
        for (let j = 0; j < sheetCount; j++) {
          const width = 4 + Math.random() * 3;
          const height = 2 + Math.random() * 2;
          const geo = new THREE.PlaneGeometry(width, height, 3, 3);
          
          // 轻微波浪
          const pos = geo.attributes.position;
          for (let k = 0; k < pos.count; k++) {
            const z = pos.getZ(k);
            pos.setZ(k, z + (Math.random() - 0.5) * 0.3);
          }
          geo.computeVertexNormals();
          
          const mat = new THREE.MeshBasicMaterial({ 
            color: 0xffffff, 
            transparent: true, 
            opacity: 0.4 + Math.random() * 0.2,
            depthWrite: false,
            side: THREE.DoubleSide
          });
          const sheet = new THREE.Mesh(geo, mat);
          sheet.rotation.x = -Math.PI / 2;
          sheet.position.set(
            (Math.random() - 0.5) * 3,
            j * 0.4,
            (Math.random() - 0.5) * 2
          );
          cloudGroup.add(sheet);
        }
      }
      
      cloudGroup.position.set(
        (Math.random() - 0.5) * 80,
        20 + Math.random() * 15,
        (Math.random() - 0.5) * 60
      );
      cloudGroup.userData = { speed: 0.005 + Math.random() * 0.01 };
      scene.add(cloudGroup);
      cloudsRef.current.push(cloudGroup);
    }
  }, []);

  const createParticles = useCallback((type = 'rain') => {
    const scene = sceneRef.current;
    const count = type === 'rain' ? 2000 : 1000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = [];
    
    for (let i = 0; i < count; i++) {
      positions[i*3] = (Math.random() - 0.5) * 100;
      positions[i*3+1] = Math.random() * 50;
      positions[i*3+2] = (Math.random() - 0.5) * 100;
      velocities.push({ 
        x: (Math.random() - 0.5) * 0.1, 
        y: type === 'rain' ? -0.4 - Math.random()*0.3 : -0.05, 
        z: (Math.random() - 0.5) * 0.1 
      });
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ 
      color: type === 'rain' ? 0xaaccff : 0xffffff, 
      size: type === 'rain' ? 0.08 : 0.15, 
      transparent: true, 
      opacity: 0.7 
    });
    const particles = new THREE.Points(geometry, material);
    particles.userData = { velocities, type };
    scene.add(particles);
    particlesRef.current.push(particles);
  }, []);

  const updateEnvironment = useCallback(() => {
    const hour = timeOfDay;
    const isNight = hour < 6 || hour > 18;
    const isDusk = (hour >= 17 && hour <= 19) || (hour >= 5 && hour <= 7);
    const angle = ((hour - 6) / 12) * Math.PI;
    
    if (sunLightRef.current) {
      sunLightRef.current.position.set(Math.cos(angle) * 50, Math.sin(angle) * 30, 20);
      sunLightRef.current.intensity = isNight ? 0 : (isDusk ? 0.5 : 1.3);
      sunLightRef.current.color.setHex(isDusk ? 0xFFAA55 : 0xFFF8E7);
    }
    
    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = isNight ? 0.15 : 0.5;
      ambientLightRef.current.color.setHex(isNight ? 0x1a1a3e : 0x6a7c8c);
    }
    
    if (sceneRef.current) {
      let skyColor;
      if (isNight) skyColor = 0x0a0a2a;
      else if (isDusk) skyColor = 0xFF7744;
      else if (hour >= 10 && hour <= 14) skyColor = 0x87CEEB;
      else skyColor = 0xc8d8e8;
      sceneRef.current.background = new THREE.Color(skyColor);
      sceneRef.current.fog.color = new THREE.Color(skyColor);
      sceneRef.current.fog.density = weather === 'fog' ? 0.015 : 0.002;
    }
    
    cloudsRef.current.forEach(cloud => {
      cloud.position.x += cloud.userData.speed;
      if (cloud.position.x > 50) cloud.position.x = -50;
    });
    
    particlesRef.current.forEach(particles => {
      const positions = particles.geometry.attributes.position.array;
      const vels = particles.userData.velocities;
      for (let i = 0; i < vels.length; i++) {
        positions[i*3] += vels[i].x;
        positions[i*3+1] += vels[i].y;
        positions[i*3+2] += vels[i].z;
        if (positions[i*3+1] < 0) {
          positions[i*3+1] = 50;
          positions[i*3] = (Math.random() - 0.5) * 100;
          positions[i*3+2] = (Math.random() - 0.5) * 100;
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;
    });
  }, [timeOfDay, weather]);

  // 初始化
  useEffect(() => {
    if (!mountRef.current) return;
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xc8d8e8);
    scene.fog = new THREE.FogExp2(0xc8d8e8, 0.002);
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(55, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(25, 20, 25);
    cameraRef.current = camera;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    const ssaoPass = new SSAOPass(scene, camera, mountRef.current.clientWidth, mountRef.current.clientHeight);
    ssaoPass.kernelRadius = 16;
    ssaoPass.minDistance = 0.005;
    ssaoPass.maxDistance = 0.1;
    composer.addPass(ssaoPass);
    
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(mountRef.current.clientWidth, mountRef.current.clientHeight), 0.25, 0.4, 0.85);
    composer.addPass(bloomPass);
    composerRef.current = composer;
    
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controls.minDistance = 3;
    controls.maxDistance = 100;
    controls.target.set(0, 4, 0);
    controlsRef.current = controls;
    
    // 光照系统
    const ambientLight = new THREE.AmbientLight(0x6a7c8c, 0.5);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;
    
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444466, 0.6);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;
    
    const sunLight = new THREE.DirectionalLight(0xfff8e7, 1.3);
    sunLight.position.set(20, 30, 15);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 200;
    sunLight.shadow.camera.left = -50;
    sunLight.shadow.camera.right = 50;
    sunLight.shadow.camera.top = 50;
    sunLight.shadow.camera.bottom = -50;
    sunLight.shadow.bias = -0.00005;
    scene.add(sunLight);
    sunLightRef.current = sunLight;
    
    // 地面 - 用于射线检测
    const groundGeo = new THREE.PlaneGeometry(200, 200, 64, 64);
    const groundMat = new THREE.MeshStandardMaterial({ 
      map: textures.brick_jinzhuan, 
      roughness: 0.4, 
      metalness: 0.05 
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    ground.name = "ground"; // 标记为地面
    scene.add(ground);
    groundRef.current = ground;
    
    // 网格辅助
    const gridHelper = new THREE.GridHelper(80, 80, 0x8B4513, 0xD2B48C);
    gridHelper.position.y = -0.49;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.15;
    scene.add(gridHelper);
    
    createClouds();
    buildPavilionWudian(-8, -8, 4);
    buildPavilionWudian(8, 8, 3);
    buildMoonGate(0, -10);
    buildRockery(-10, 10);
    buildRockery(10, -10);
    
    // 预览网格
    const previewGeo = new THREE.BoxGeometry(1, 1, 1);
    const previewMat = new THREE.MeshBasicMaterial({ 
      color: 0xD4AF37, 
      transparent: true, 
      opacity: 0.3, 
      wireframe: true 
    });
    const previewMesh = new THREE.Mesh(previewGeo, previewMat);
    previewMesh.visible = false;
    scene.add(previewMesh);
    previewMeshRef.current = previewMesh;
    
    // 加载存档
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('/api/world/load', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          if (res.data.worldData?.blocks) {
            const toRemove = blocksRef.current.filter(b => b.position.y > -0.4);
            toRemove.forEach(b => scene.remove(b));
            blocksRef.current = blocksRef.current.filter(b => b.position.y <= -0.4);
            res.data.worldData.blocks.forEach(block => 
              addBlock(scene, block.x, block.y, block.z, block.type, true, block.rotation)
            );
            toast.success('营造存档载入成功');
          }
        }).catch(() => {});
    }
    
    // 动画循环
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      updateEnvironment();
      if (previewMeshRef.current && previewMeshRef.current.visible) {
        previewMeshRef.current.rotation.y += 0.01;
      }
      composer.render();
    };
    animate();
    
    // 交互处理 - 关键修复：包含地面检测
    let lastClickPos = { x: 0, y: 0 };
    
    const handlePointerDown = (e) => {
      const rect = mountRef.current.getBoundingClientRect();
      const currentX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const currentY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      mouseRef.current.set(currentX, currentY);
      
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      
      // 关键修改：同时检测方块和地面
      const intersects = raycasterRef.current.intersectObjects(
        [...blocksRef.current, ground], 
        true
      );
      
      const now = Date.now();
      const timeDiff = now - lastClickTimeRef.current;
      const distDiff = Math.hypot(currentX - lastClickPos.x, currentY - lastClickPos.y);
      
      if (timeDiff < 300 && distDiff < 0.1 && e.button === 0 && !e.shiftKey) {
        // 双击放置
        if (intersects.length > 0) {
          const hit = intersects[0];
          let normal, point;
          
          if (hit.object.name === "ground") {
            // 如果击中地面，法线向上，点就是击中点
            normal = new THREE.Vector3(0, 1, 0);
            point = hit.point;
          } else {
            // 击中方块，使用面法线
            normal = hit.face.normal.clone().transformDirection(hit.object.matrixWorld).round();
            point = hit.point;
          }
          
          const newPos = point.clone().add(normal.multiplyScalar(0.5));
          newPos.x = Math.round(newPos.x);
          newPos.y = Math.max(0, Math.round(newPos.y)); // 不允许低于地面
          newPos.z = Math.round(newPos.z);
          
          const existing = blocksRef.current.find(b => 
            Math.abs(b.position.x - newPos.x) < 0.1 && 
            Math.abs(b.position.y - newPos.y) < 0.1 && 
            Math.abs(b.position.z - newPos.z) < 0.1
          );
          
          if (!existing && newPos.y < 30) {
            addBlock(scene, newPos.x, newPos.y, newPos.z, currentBlockTypeRef.current);
            setShowHint(blockData[currentBlockTypeRef.current]?.hint);
            setTimeout(() => setShowHint(null), 3000);
            
            // 粒子特效
            const particleGeo = new THREE.BufferGeometry();
            const particlePos = new Float32Array(20 * 3);
            for(let i=0; i<20; i++) {
              particlePos[i*3] = newPos.x + (Math.random()-0.5)*0.5;
              particlePos[i*3+1] = newPos.y + (Math.random()-0.5)*0.5;
              particlePos[i*3+2] = newPos.z + (Math.random()-0.5)*0.5;
            }
            particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
            const particleMat = new THREE.PointsMaterial({ color: 0xD4AF37, size: 0.1 });
            const parts = new THREE.Points(particleGeo, particleMat);
            scene.add(parts);
            setTimeout(() => scene.remove(parts), 500);
          }
        }
        lastClickTimeRef.current = 0;
      } else {
        lastClickTimeRef.current = now;
        lastClickPos = { x: currentX, y: currentY };
        
        // 删除模式
        if (e.button === 2 || (e.button === 0 && e.shiftKey)) {
          const blockIntersects = raycasterRef.current.intersectObjects(blocksRef.current, true);
          if (blockIntersects.length > 0) {
            const hit = blockIntersects[0].object;
            const block = hit.userData.type ? hit : hit.parent;
            if (block && block.position.y > -0.3) removeBlock(scene, block);
          }
        }
      }
    };
    
    const handlePointerMove = (e) => {
      const rect = mountRef.current.getBoundingClientRect();
      mouseRef.current.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1, 
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(
        [...blocksRef.current, ground], 
        true
      );
      
      if (intersects.length > 0 && !e.shiftKey && e.buttons === 0) {
        const hit = intersects[0];
        let normal, point;
        
        if (hit.object.name === "ground") {
          normal = new THREE.Vector3(0, 1, 0);
          point = hit.point;
        } else {
          normal = hit.face.normal.clone().transformDirection(hit.object.matrixWorld).round();
          point = hit.point;
        }
        
        const newPos = point.clone().add(normal.multiplyScalar(0.5));
        newPos.x = Math.round(newPos.x);
        newPos.y = Math.max(0, Math.round(newPos.y));
        newPos.z = Math.round(newPos.z);
        
        previewMeshRef.current.position.copy(newPos);
        previewMeshRef.current.visible = true;
        
        const info = blockData[currentBlockTypeRef.current];
        if (info) previewMeshRef.current.material.color.set(info.color);
      } else {
        previewMeshRef.current.visible = false;
      }
    };
    
    const handleContextMenu = (e) => e.preventDefault();
    
    window.addEventListener('keydown', (e) => { 
      if (e.key === 'Tab') { 
        e.preventDefault(); 
        setToolbarCollapsed(prev => !prev); 
      } 
    });
    
    mountRef.current.addEventListener('pointerdown', handlePointerDown);
    mountRef.current.addEventListener('pointermove', handlePointerMove);
    mountRef.current.addEventListener('contextmenu', handleContextMenu);
    
    const resizeHandler = () => {
      const w = mountRef.current.clientWidth, h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
    };
    window.addEventListener('resize', resizeHandler);
    
    return () => {
      window.removeEventListener('resize', resizeHandler);
      mountRef.current?.removeEventListener('pointerdown', handlePointerDown);
      mountRef.current?.removeEventListener('pointermove', handlePointerMove);
      mountRef.current?.removeEventListener('contextmenu', handleContextMenu);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      controls.dispose();
      composer.dispose();
    };
  }, [addBlock, removeBlock, buildPavilionWudian, buildMoonGate, buildRockery, createClouds, updateEnvironment, textures, blockData, getBoxGeometry]);

  // 功能接口
  const saveWorld = async () => {
    const token = localStorage.getItem('token');
    if (!token) return toast.error('请先登录以保存营造');
    const blocksData = blocksRef.current
      .filter(b => b.userData?.type)
      .map(b => ({
        x: Math.round(b.position.x*10)/10,
        y: Math.round(b.position.y*10)/10,
        z: Math.round(b.position.z*10)/10,
        type: b.userData.type,
        rotation: Math.round(b.rotation.y*100)/100
      }));
    try {
      await axios.post('/api/world/save', { 
        worldData: { blocks: blocksData, timestamp: Date.now() } 
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('营造法式存档已保存');
    } catch (err) { 
      toast.error('存档失败，请检查网络'); 
    }
  };
  
  const clearWorld = () => {
    if (window.confirm('确定要清空所有营造吗？此操作不可撤销。')) {
      const scene = sceneRef.current;
      const toDelete = blocksRef.current.filter(b => b.position.y > -0.4);
      toDelete.forEach(block => { 
        scene.remove(block);
        block.traverse(child => {
          if (child.isMesh && child.geometry !== window._sharedBoxGeo) {
            child.geometry.dispose();
          }
        });
      });
      blocksRef.current = blocksRef.current.filter(b => b.position.y <= -0.4);
      toast.success('营造已重置');
    }
  };
  
  const joinMultiplayer = () => {
    const roomId = prompt('输入营造房间号（或留空创建新房）');
    if (roomId === null) return;
    const finalRoom = roomId || `营造_${Date.now()}`;
    setMultiplayerRoom(finalRoom);
    socketRef.current = io();
    socketRef.current.emit('join-room', finalRoom);
    socketRef.current.on('block-placed', (data) => 
      addBlock(sceneRef.current, data.x, data.y, data.z, data.type, true, data.rotation)
    );
    socketRef.current.on('block-removed', (data) => {
      const block = blocksRef.current.find(b => 
        Math.abs(b.position.x - data.x) < 0.1 && 
        Math.abs(b.position.y - data.y) < 0.1 && 
        Math.abs(b.position.z - data.z) < 0.1
      );
      if (block) removeBlock(sceneRef.current, block, true);
    });
    toast.success(`已进入营造协作房间: ${finalRoom}`);
  };
  
  const toggleWeather = (type) => {
    particlesRef.current.forEach(p => sceneRef.current.remove(p));
    particlesRef.current = [];
    if (type === weather) setWeather('clear');
    else { 
      setWeather(type); 
      if (type !== 'clear') createParticles(type); 
    }
  };

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      height: '90vh', 
      minHeight: 700, 
      borderRadius: 20, 
      overflow: 'hidden', 
      boxShadow: '0 25px 80px rgba(0,0,0,0.4)', 
      background: 'linear-gradient(135deg, #0f0f1e 0%, #1a1a3e 100%)',
      fontFamily: "'Noto Serif SC', 'Source Han Serif SC', 'SimSun', serif"
    }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'crosshair' }} />
      
      {/* 提示框 */}
      {showHint && (
        <div style={{ 
          position: 'absolute', 
          bottom: toolbarCollapsed ? 100 : 200, 
          left: '50%', 
          transform: 'translateX(-50%)', 
          background: 'linear-gradient(135deg, rgba(139,69,19,0.95), rgba(101,67,33,0.95))', 
          color: '#F5E6D3', 
          padding: '16px 28px', 
          borderRadius: 12, 
          fontSize: 15, 
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)', 
          backdropFilter: 'blur(12px)', 
          zIndex: 30, 
          pointerEvents: 'none', 
          border: '2px solid #D4AF37', 
          maxWidth: 360, 
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 20, marginBottom: 8, fontWeight: 'bold', color: '#FFD700' }}>
            🏛️ {blockData[blockType]?.name}
          </div>
          <div>{showHint}</div>
        </div>
      )}
      
      {/* 时间控制 */}
      <div style={{ 
        position: 'absolute', 
        top: 24, 
        right: 24, 
        background: 'rgba(0,0,0,0.6)', 
        padding: '12px 20px', 
        borderRadius: 30, 
        color: 'white', 
        zIndex: 20, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 12, 
        backdropFilter: 'blur(10px)' 
      }}>
        <span>{timeOfDay >=6 && timeOfDay<18 ? (timeOfDay>=12?'☀️':'🌅') : (timeOfDay>=18 && timeOfDay<20?'🌇':'🌙')}</span>
        <input 
          type="range" 
          min="0" 
          max="24" 
          step="0.5" 
          value={timeOfDay} 
          onChange={e => setTimeOfDay(parseFloat(e.target.value))} 
          style={{ width: 120, accentColor: '#D4AF37' }}
        />
        <span style={{ fontSize: 14, fontWeight: 'bold', minWidth: 50, textAlign: 'center', color: '#D4AF37' }}>
          {String(Math.floor(timeOfDay)).padStart(2,'0')}:{String(Math.round((timeOfDay%1)*60)).padStart(2,'0')}
        </span>
      </div>
      
      {/* 天气控制 */}
      <div style={{ position: 'absolute', top: 80, right: 24, display: 'flex', gap: 10, zIndex: 20 }}>
        {[{key:'clear',icon:'☀️'},{key:'rain',icon:'🌧️'},{key:'snow',icon:'❄️'}].map(w => (
          <button 
            key={w.key} 
            onClick={() => toggleWeather(w.key)} 
            style={{ 
              width: 44, 
              height: 44, 
              borderRadius: '50%', 
              border: 'none', 
              background: weather === w.key ? 'linear-gradient(135deg,#D4AF37,#B8941F)' : 'rgba(0,0,0,0.6)', 
              color: 'white', 
              cursor: 'pointer', 
              fontSize: 20 
            }}
          >
            {w.icon}
          </button>
        ))}
      </div>
      
      {/* 折叠按钮 */}
      <button 
        onClick={() => setToolbarCollapsed(!toolbarCollapsed)} 
        style={{ 
          position: 'absolute', 
          bottom: toolbarCollapsed ? 20 : 320, 
          left: '50%', 
          transform: 'translateX(-50%)', 
          width: 48, 
          height: 32, 
          borderRadius: '16px 16px 0 0', 
          border: 'none', 
          background: 'rgba(20,20,30,0.95)', 
          color: '#D4AF37', 
          cursor: 'pointer', 
          zIndex: 25 
        }}
      >
        {toolbarCollapsed ? '▲' : '▼'}
      </button>
      
      {/* 工具栏 */}
      <div style={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        background: 'linear-gradient(180deg, rgba(15,15,25,0.98) 0%, rgba(10,10,20,0.99) 100%)', 
        backdropFilter: 'blur(30px)', 
        borderRadius: toolbarCollapsed ? '20px 20px 0 0' : '24px 24px 0 0', 
        padding: toolbarCollapsed ? '12px 24px' : '20px 28px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 14, 
        zIndex: 20, 
        border: '1px solid rgba(212,175,55,0.25)', 
        transform: toolbarCollapsed ? 'translateY(calc(100% - 60px))' : 'translateY(0)', 
        transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
        maxHeight: '40vh'
      }}>
        {/* 分类选择器 */}
        <div style={{ 
          display: 'flex', 
          gap: 8, 
          overflowX: 'auto', 
          paddingBottom: 8,
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                background: selectedCategory === cat.key 
                  ? 'linear-gradient(135deg, #D4AF37, #B8941F)' 
                  : 'rgba(255,255,255,0.08)',
                color: selectedCategory === cat.key ? '#1a1a2e' : '#D4AF37',
                border: 'none',
                borderRadius: 20,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
        
        {/* 方块网格 - 根据分类筛选 */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', 
          gap: 10, 
          maxHeight: toolbarCollapsed ? 0 : '180px', 
          overflowY: 'auto', 
          transition: 'max-height 0.3s ease',
          padding: '4px'
        }}>
          {filteredBlocks.map(([type, v]) => {
            const isActive = blockType === type;
            return (
              <button 
                key={type} 
                onClick={() => {
                  setBlockType(type);
                  currentBlockTypeRef.current = type;
                }}
                title={`${v.name} - ${v.hint}`}
                style={{ 
                  width: '100%',
                  aspectRatio: '1',
                  background: isActive 
                    ? `linear-gradient(135deg, ${v.color}, ${adjustColor(v.color, 30)})` 
                    : 'rgba(255,255,255,0.08)', 
                  borderRadius: 12, 
                  border: isActive ? `3px solid ${adjustColor(v.color, 50)}` : '2px solid rgba(255,255,255,0.15)', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  position: 'relative',
                  transition: 'all 0.2s',
                  transform: isActive ? 'scale(1.05)' : 'scale(1)'
                }}
              >
                <span style={{ 
                  fontSize: 10, 
                  color: isActive ? '#fff' : '#ccc', 
                  fontWeight: 'bold',
                  textAlign: 'center',
                  lineHeight: 1.2
                }}>
                  {v.name}
                </span>
                {v.category === 'plant' && <span style={{fontSize: 14}}>🌿</span>}
                {v.category === 'pillar' && <span style={{fontSize: 14}}>🏛️</span>}
                {v.category === 'dougong' && <span style={{fontSize: 14}}>⛩️</span>}
              </button>
            );
          })}
        </div>
        
        {/* 底部操作栏 */}
        <div style={{ 
          display: 'flex', 
          gap: 12, 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginTop: 4, 
          paddingTop: 12, 
          borderTop: '1px solid rgba(255,255,255,0.1)' 
        }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <button 
              onClick={saveWorld} 
              style={{ 
                padding: '10px 20px', 
                background: 'linear-gradient(135deg,#D4AF37,#B8941F)', 
                border: 'none', 
                borderRadius: 24, 
                color: '#1a1a2e', 
                fontWeight: 'bold', 
                cursor: 'pointer' 
              }}
            >
              💾 存档
            </button>
            <button 
              onClick={clearWorld} 
              style={{ 
                padding: '10px 20px', 
                background: 'rgba(139,0,0,0.8)', 
                border: '1px solid #8B0000', 
                borderRadius: 24, 
                color: 'white', 
                cursor: 'pointer' 
              }}
            >
              🗑️ 清空
            </button>
            <button 
              onClick={joinMultiplayer} 
              style={{ 
                padding: '10px 20px', 
                background: 'rgba(70,130,180,0.8)', 
                border: '1px solid #4682B4', 
                borderRadius: 24, 
                color: 'white', 
                cursor: 'pointer' 
              }}
            >
              👥 协作
            </button>
          </div>
          <div style={{ 
            color: '#aaa', 
            fontSize: 12, 
            display: 'flex', 
            gap: 12, 
            background: 'rgba(0,0,0,0.3)', 
            padding: '8px 16px', 
            borderRadius: 20 
          }}>
            <span>双击放置</span>
            <span>|</span>
            <span>右键/Shift+左键拆除</span>
            <span>|</span>
            <span>Tab 收起工具栏</span>
          </div>
        </div>
      </div>
      
      {/* 标题 */}
      <div style={{ position: 'absolute', top: 24, left: 24, zIndex: 20 }}>
        <div style={{ color: '#D4AF37', fontSize: 32, fontWeight: 'bold', letterSpacing: 12 }}>
          营造法式
        </div>
        <div style={{ color: 'rgba(212,175,55,0.7)', fontSize: 12, letterSpacing: 4 }}>
          高精度中式建筑仿真系统
        </div>
      </div>
      
      {/* 当前选择 */}
      <div style={{ 
        position: 'absolute', 
        top: 24, 
        left: '50%', 
        transform: 'translateX(-50%)', 
        background: 'rgba(0,0,0,0.7)', 
        padding: '10px 24px', 
        borderRadius: 30, 
        color: '#D4AF37', 
        fontSize: 14, 
        fontWeight: 'bold', 
        zIndex: 20, 
        backdropFilter: 'blur(10px)', 
        display: 'flex', 
        gap: 10 
      }}>
        <span>当前营造:</span>
        <span style={{ 
          color: '#fff', 
          padding: '4px 12px', 
          background: 'rgba(212,175,55,0.2)', 
          borderRadius: 12 
        }}>
          {blockData[blockType]?.name}
        </span>
      </div>
      
      {/* 多人房间提示 */}
      {multiplayerRoom && (
        <div style={{ 
          position: 'absolute', 
          top: 80, 
          left: '50%', 
          transform: 'translateX(-50%)', 
          background: 'rgba(70,130,180,0.9)', 
          padding: '8px 20px', 
          borderRadius: 20, 
          color: 'white', 
          fontSize: 13, 
          display: 'flex', 
          gap: 8 
        }}>
          <span>👥</span>
          <span>协作房间: {multiplayerRoom}</span>
          <button 
            onClick={() => {
              setMultiplayerRoom(null);
              socketRef.current?.disconnect();
              toast.success('已退出协作房间');
            }} 
            style={{ 
              marginLeft: 8, 
              background: 'rgba(255,255,255,0.2)', 
              border: 'none', 
              borderRadius: '50%', 
              width: 20, 
              height: 20, 
              cursor: 'pointer',
              color: 'white'
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default GameModule;