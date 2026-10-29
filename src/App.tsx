import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginView } from './components/LoginView';
import { RoomListView } from './components/RoomListView';
import { RoomDetailView } from './components/RoomDetailView';
import { NewRoomModal } from './components/NewRoomModal';
import { JoinRoomModal } from './components/JoinRoomModal';
import { AISuiteModal } from './components/AISuiteModal';
import { roomsService } from './lib/rooms';
import { CourseRoom } from './types';

function AcademicClassroomApp() {
  const { currentUser, loading } = useAuth();

  // Rooms state
  const [rooms, setRooms] = useState<CourseRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isJoinOpen, setIsJoinOpen] = useState<boolean>(false);
  const [isAIOpen, setIsAIOpen] = useState<boolean>(false);
  const [initialJoinCode, setInitialJoinCode] = useState<string>('');

  // Subscribe to rooms - called unconditionally
  useEffect(() => {
    if (!currentUser) return;

    const unsub = roomsService.subscribeRooms(currentUser.uid, (list) => {
      setRooms(list);
    });

    // Check URL parameters for ?roomCode=XYZ
    try {
      const params = new URLSearchParams(window.location.search);
      const codeParam = params.get('roomCode');
      if (codeParam) {
        setInitialJoinCode(codeParam.toUpperCase());
        setIsJoinOpen(true);
      }
    } catch {}

    return () => unsub();
  }, [currentUser]);

  // Selected room object - memoized safely
  const selectedRoom = useMemo(() => {
    if (!selectedRoomId) return null;
    return rooms.find((r) => r.id === selectedRoomId) || null;
  }, [rooms, selectedRoomId]);

  // Handlers
  const handleRoomCreated = (newRoom: CourseRoom) => {
    setRooms((prev) => [newRoom, ...prev]);
    setSelectedRoomId(newRoom.id);
  };

  const handleRoomJoined = (room: CourseRoom) => {
    setRooms(roomsService.getRooms());
    setSelectedRoomId(room.id);
  };

  const handleRefreshRooms = () => {
    setRooms(roomsService.getRooms());
  };

  // 1. Loading Guard (rendered AFTER all hooks)
  if (loading) {
    return (
      <div className="min-h-screen bg-[#080911] flex flex-col items-center justify-center text-white font-sans">
        <div className="w-10 h-10 border-3 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold tracking-widest uppercase font-mono text-violet-300">
          Memuat Ruang Diskusi Akademik...
        </p>
      </div>
    );
  }

  // 2. Wajib Login Guard (rendered AFTER all hooks)
  if (!currentUser) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-[#080911] text-slate-100 font-sans">
      {/* Either Room Detail View or Room Grid Hub */}
      {selectedRoom ? (
        <RoomDetailView
          room={selectedRoom}
          onBack={() => setSelectedRoomId(null)}
          onRefreshRoom={handleRefreshRooms}
        />
      ) : (
        <RoomListView
          rooms={rooms}
          onSelectRoom={(r) => setSelectedRoomId(r.id)}
          onOpenCreateModal={() => setIsCreateOpen(true)}
          onOpenJoinModal={() => { setInitialJoinCode(''); setIsJoinOpen(true); }}
          onOpenAISuite={() => setIsAIOpen(true)}
        />
      )}

      {/* Modals */}
      <NewRoomModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onRoomCreated={handleRoomCreated}
      />

      <JoinRoomModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        onJoined={handleRoomJoined}
        initialCode={initialJoinCode}
      />

      <AISuiteModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AcademicClassroomApp />
    </AuthProvider>
  );
}
