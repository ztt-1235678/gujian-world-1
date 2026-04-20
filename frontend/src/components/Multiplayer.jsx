import React, { useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const Multiplayer = () => {
  const [roomId, setRoomId] = useState('');
  const [joined, setJoined] = useState(false);
  const [socket, setSocket] = useState(null);

  const createRoom = () => {
    const newRoomId = `room_${Date.now()}`;
    setRoomId(newRoomId);
    joinRoom(newRoomId);
  };

  const joinRoom = (id = roomId) => {
    if (!id.trim()) {
      toast.error('请输入房间号');
      return;
    }
    const newSocket = io();
    newSocket.emit('join-room', id);
    newSocket.on('user-joined', () => toast.success('新用户加入房间'));
    setSocket(newSocket);
    setJoined(true);
    toast.success(`已加入房间: ${id}`);
  };

  const leaveRoom = () => {
    if (socket) socket.disconnect();
    setJoined(false);
    setSocket(null);
    toast.success('已离开房间');
  };

  return (
    <div className="ink-wash">
      <h2 className="chinese-title" style={{ fontSize: 30, textAlign: 'center', color: '#5C2E0A' }}>👥 多人协作建造</h2>
      <div className="chinese-divider" />
      <div className="window-frame" style={{ background: 'white', padding: 28 }}>
        {!joined ? (
          <div>
            <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
              <input
                type="text"
                placeholder="输入房间号"
                value={roomId}
                onChange={e => setRoomId(e.target.value)}
                className="chinese-text"
                style={{ flex: 1, padding: 12, borderRadius: 40, border: '1px solid #D4A373' }}
              />
              <button onClick={() => joinRoom()} className="btn-primary">加入房间</button>
            </div>
            <button onClick={createRoom} className="btn-secondary" style={{ width: '100%' }}>创建新房间</button>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: 20 }}>
              <strong className="chinese-text">当前房间：</strong> 
              <span style={{ fontFamily: 'monospace', fontSize: 16, marginLeft: 10 }}>{roomId}</span>
            </div>
            <button onClick={leaveRoom} className="btn-secondary" style={{ width: '100%' }}>离开房间</button>
            <div className="huiwen-border" style={{ margin: '20px 0 0' }} />
            <p className="chinese-text" style={{ marginTop: 16, fontSize: 13, color: '#666', textAlign: 'center' }}>
              💡 加入房间后，你和好友可以同时建造同一个世界！
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Multiplayer;