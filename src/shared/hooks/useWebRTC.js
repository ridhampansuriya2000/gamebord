import { useState, useEffect, useRef, useCallback } from 'react';

export const useWebRTC = (socket, roomId) => {
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [voiceError, setVoiceError] = useState(null);
  const [opponentVoiceActive, setOpponentVoiceActive] = useState(false);
  
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);

  const startVoiceChat = useCallback(async () => {
    try {
      setVoiceError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;
      setIsVoiceActive(true);
      setIsMicMuted(false);
      setIsSpeakerMuted(false);

      if (socket && roomId) {
        socket.emit('voice-status', { roomId, isActive: true });
      }

      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      };

      peerConnectionRef.current = new RTCPeerConnection(configuration);

      // Add local tracks
      stream.getTracks().forEach((track) => {
        peerConnectionRef.current.addTrack(track, stream);
      });

      // Handle incoming remote tracks
      peerConnectionRef.current.ontrack = (event) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
        }
      };

      // Handle ICE candidates
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate && socket && roomId) {
          socket.emit('webrtc-ice-candidate', { roomId, candidate: event.candidate });
        }
      };

      // Create Offer
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      
      if (socket && roomId) {
        socket.emit('webrtc-offer', { roomId, offer });
      }

    } catch (err) {
      console.error('Failed to access microphone', err);
      setVoiceError('Microphone access denied or unavailable.');
      setIsVoiceActive(false);
    }
  }, [socket, roomId]);

  const stopVoiceChat = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setIsVoiceActive(false);
    setIsMicMuted(false);
    setIsSpeakerMuted(false);
    
    if (socket && roomId) {
      socket.emit('voice-status', { roomId, isActive: false });
    }
  }, [socket, roomId]);

  // Toggle microphone (mute/unmute your own mic)
  const toggleMic = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicMuted(!audioTrack.enabled);
      }
    }
  }, []);

  // Keep backward compat alias
  const toggleMute = toggleMic;

  // Toggle speaker (mute/unmute opponent's audio)
  const toggleSpeaker = useCallback(() => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = !remoteAudioRef.current.muted;
      setIsSpeakerMuted(prev => !prev);
    }
  }, []);

  // Socket signaling listeners
  useEffect(() => {
    if (!socket) return;

    const handleOffer = async (offer) => {
      if (!peerConnectionRef.current) return;
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      socket.emit('webrtc-answer', { roomId, answer });
    };

    const handleAnswer = async (answer) => {
      if (!peerConnectionRef.current) return;
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    };

    const handleIceCandidate = async (candidate) => {
      if (!peerConnectionRef.current) return;
      try {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error('Error adding received ice candidate', e);
      }
    };
    
    const handleVoiceStatus = ({ isActive }) => {
      setOpponentVoiceActive(isActive);
    };

    socket.on('webrtc-offer', handleOffer);
    socket.on('webrtc-answer', handleAnswer);
    socket.on('webrtc-ice-candidate', handleIceCandidate);
    socket.on('opponent-voice-status', handleVoiceStatus);

    return () => {
      socket.off('webrtc-offer', handleOffer);
      socket.off('webrtc-answer', handleAnswer);
      socket.off('webrtc-ice-candidate', handleIceCandidate);
      socket.off('opponent-voice-status', handleVoiceStatus);
    };
  }, [socket, roomId]);

  // Clean up on unmount
  useEffect(() => {
    return () => stopVoiceChat();
  }, [stopVoiceChat]);

  return {
    isVoiceActive,
    isMicMuted,
    isMuted: isMicMuted, // backward compat
    isSpeakerMuted,
    voiceError,
    opponentVoiceActive,
    startVoiceChat,
    stopVoiceChat,
    toggleMic,
    toggleMute, // backward compat
    toggleSpeaker,
    remoteAudioRef
  };
};
