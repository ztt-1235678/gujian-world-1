import React from 'react';

const ChineseDeco = () => {
  return (
    <>
      {/* 左上角山水墨韵 */}
      <div style={{
        position: 'fixed',
        top: 60,
        left: 15,
        width: 140,
        height: 100,
        opacity: 0.12,
        pointerEvents: 'none',
        zIndex: 0,
        background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 120 100\'%3E%3Cpath fill=\'%238B4513\' d=\'M10,80 L25,45 L40,65 L55,25 L70,55 L85,30 L100,60 L110,80 Z\' opacity=\'0.6\'/%3E%3C/svg%3E") no-repeat center/contain'
      }} />

      {/* 右下角名章 */}
      <div style={{
        position: 'fixed',
        bottom: 70,
        right: 20,
        width: 70,
        height: 70,
        opacity: 0.18,
        pointerEvents: 'none',
        zIndex: 0,
        background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Crect x=\'12\' y=\'12\' width=\'76\' height=\'76\' fill=\'none\' stroke=\'%238B4513\' stroke-width=\'2.5\'/%3E%3Ctext x=\'50\' y=\'58\' font-size=\'22\' text-anchor=\'middle\' fill=\'%238B4513\' font-family=\'serif\'%3E智境%3C/text%3E%3C/svg%3E") no-repeat center/contain'
      }} />

      {/* 右上角闲章 */}
      <div style={{
        position: 'fixed',
        top: 90,
        right: 30,
        width: 55,
        height: 55,
        opacity: 0.12,
        pointerEvents: 'none',
        zIndex: 0,
        background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 80 80\'%3E%3Ccircle cx=\'40\' cy=\'40\' r=\'32\' fill=\'none\' stroke=\'%23B22222\' stroke-width=\'2\'/%3E%3Ctext x=\'40\' y=\'48\' font-size=\'16\' text-anchor=\'middle\' fill=\'%23B22222\' font-family=\'serif\'%3E古%3C/text%3E%3C/svg%3E") no-repeat center/contain'
      }} />

      {/* 左下角竹叶装饰 */}
      <div style={{
        position: 'fixed',
        bottom: 90,
        left: 25,
        width: 90,
        height: 130,
        opacity: 0.1,
        pointerEvents: 'none',
        zIndex: 0,
        background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 60 100\'%3E%3Cpath fill=\'%234A7C59\' d=\'M30,10 L30,90 M22,35 L38,35 M18,55 L42,55 M24,75 L36,75\' stroke=\'%234A7C59\' stroke-width=\'2\'/%3E%3C/svg%3E") no-repeat center/contain'
      }} />

      {/* 右上角月亮 */}
      <div style={{
        position: 'fixed',
        top: 120,
        right: 50,
        width: 45,
        height: 45,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(212,163,115,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* 底部回纹装饰条 */}
      <div className="huiwen-border" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 3, margin: 0, zIndex: 1 }} />
    </>
  );
};

export default ChineseDeco;