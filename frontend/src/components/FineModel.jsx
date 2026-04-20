import React from 'react';
import { Box, Cylinder, Sphere, Group, Cone } from '@react-three/drei';

// 精细斗拱模型组件
export const DougongModel = ({ position, color = '#CD853F', scale = 1, rotation = 0 }) => {
  return (
    <group position={position} scale={scale} rotation={[0, rotation, 0]}>
      <Box args={[0.8, 0.25, 0.8]} position={[0, 0, 0]} color={color} />
      <Box args={[1.1, 0.18, 0.35]} position={[0, 0.3, 0]} color={color} />
      <Box args={[1.1, 0.18, 0.35]} position={[0, 0.3, 0.6]} color={color} />
      <Box args={[1.1, 0.18, 0.35]} position={[0, 0.3, -0.6]} color={color} />
      <Box args={[0.35, 0.18, 1.1]} position={[0.6, 0.3, 0]} color={color} />
      <Box args={[0.35, 0.18, 1.1]} position={[-0.6, 0.3, 0]} color={color} />
      <Box args={[0.5, 0.18, 0.5]} position={[0, 0.52, 0]} color="#A0522D" />
      <Cylinder args={[0.12, 0.2, 0.5, 6]} position={[0.7, 0.52, 0]} color={color} rotation={[0, 0, Math.PI / 6]} />
      <Cylinder args={[0.12, 0.2, 0.5, 6]} position={[-0.7, 0.52, 0]} color={color} rotation={[0, 0, -Math.PI / 6]} />
    </group>
  );
};

// 精细鸱吻模型
export const ChiwenModel = ({ position, color = '#E6B422', scale = 1 }) => {
  return (
    <group position={position} scale={scale}>
      <Cylinder args={[0.22, 0.35, 0.7, 8]} position={[0, 0.35, 0]} color={color} />
      <Cylinder args={[0.1, 0.1, 0.55, 6]} position={[0.28, 0.6, 0]} color={color} rotation={[0.3, 0, 0.5]} />
      <Sphere args={[0.18, 16, 16]} position={[-0.18, 0.6, 0]} color={color} />
      <Cylinder args={[0.07, 0.07, 0.28, 4]} position={[-0.32, 0.75, 0.08]} color="#FFD700" rotation={[0.2, 0, 0.3]} />
      <Box args={[0.04, 0.04, 0.12]} position={[0.08, 0.48, 0.18]} color="#FFD700" />
      <Box args={[0.04, 0.04, 0.12]} position={[0.18, 0.48, 0.18]} color="#FFD700" />
    </group>
  );
};

// 精细藻井模型
export const CaijingModel = ({ position, color = '#D4AF37', scale = 1 }) => {
  return (
    <group position={position} scale={scale}>
      <Box args={[1.4, 0.08, 1.4]} position={[0, 0, 0]} color={color} />
      <group rotation={[0, Math.PI / 8, 0]}>
        <Box args={[1.0, 0.08, 1.0]} position={[0, 0.18, 0]} color="#CD853F" />
      </group>
      <Cylinder args={[0.55, 0.72, 0.12, 8]} position={[0, 0.35, 0]} color={color} />
      <Sphere args={[0.18, 24, 24]} position={[0, 0.48, 0]} color="#E6B422" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
        <DougongModel key={angle} position={[Math.cos(angle * Math.PI / 180) * 0.65, 0.08, Math.sin(angle * Math.PI / 180) * 0.65]} scale={0.35} rotation={angle} />
      ))}
    </group>
  );
};

// 精细柱子模型
export const PillarModel = ({ position, height = 3, color = '#8B5A2B' }) => {
  return (
    <group position={position}>
      <Cylinder args={[0.32, 0.38, height, 12]} position={[0, height/2, 0]} color={color} />
      <Cylinder args={[0.46, 0.5, 0.22, 8]} position={[0, -0.08, 0]} color="#888888" />
      <Cylinder args={[0.42, 0.46, 0.12, 8]} position={[0, 0.12, 0]} color="#999999" />
      <Cylinder args={[0.36, 0.4, 0.12, 8]} position={[0, height + 0.04, 0]} color="#A0522D" />
    </group>
  );
};

// 精细屋顶模型
export const RoofModel = ({ position, width = 4, depth = 4, height = 1.3, color = '#2F4F4F' }) => {
  return (
    <group position={position}>
      <Box args={[width + 0.15, 0.08, depth + 0.15]} position={[0, height, 0]} color="#555555" />
      <Cylinder args={[width/1.75, width/2.1, height*0.7, 4]} position={[0, height*0.45, 0]} color={color} rotation={[0, Math.PI/4, 0]} />
      {[...Array(7)].map((_, i) => (
        <Box key={i} args={[0.04, 0.015, depth - 0.4]} position={[-width/2.3 + i * 0.32, height - 0.04, 0]} color="#1a1a1a" />
      ))}
      <ChiwenModel position={[width/2.0, height + 0.08, 0]} scale={0.55} />
      <ChiwenModel position={[-width/2.0, height + 0.08, 0]} scale={0.55} />
    </group>
  );
};

export default {
  DougongModel,
  ChiwenModel,
  CaijingModel,
  PillarModel,
  RoofModel
};