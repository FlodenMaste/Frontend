import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mic, MicOff, Video, VideoOff, Phone, MessageSquare, Users, Share2, X } from 'lucide-react';

const VirtualClassroom = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{
    id: string;
    sender: string;
    text: string;
    timestamp: Date;
  }>>([]);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Mock participants
  const participants = [
    { id: 'i1', name: 'Professeur (Formateur)', role: 'formateur' },
    { id: user?.id || 'u1', name: user?.nom|| 'Vous', role: user?.role || 'etudiant' },
    { id: 's1', name: 'Alice Johnson', role: 'etudiant' },
    { id: 's2', name: 'Bob Smith', role: 'etudiant' },
  ];

  useEffect(() => {
    const setupMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        // Simulate remote stream
        setTimeout(() => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
          }
        }, 1000);
        
        return () => {
          stream.getTracks().forEach((track) => track.stop());
        };
      } catch (err) {
        console.error('Erreur accès média:', err);
      }
    };
    
    setupMedia();
  }, []);

  const toggleAudio = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const toggleVideo = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && user) {
      const newMessage = {
        id: Date.now().toString(),
        sender: user.nom || 'Anonyme',
        text: message,
        timestamp: new Date(),
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  const leaveClassroom = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    navigate(`/courses/${id}`);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
        <h1 className="text-xl font-bold">Classe Virtuelle - Cours #{id}</h1>
        <button
          onClick={leaveClassroom}
          className="flex items-center px-3 py-1 bg-red-600 rounded hover:bg-red-700"
        >
          <X className="h-5 w-5 mr-1" />
          Quitter
        </button>
      </div>
      
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video grid */}
        <div className={`flex-1 p-4 ${isChatOpen || isParticipantsOpen ? 'lg:mr-80' : ''}`}>
          <div className="relative h-full rounded-lg bg-gray-800 overflow-hidden">
            {/* Main video */}
            <video
              ref={remoteVideoRef}
              className="h-full w-full object-cover"
              autoPlay
              playsInline
            />
            
            {/* Local video */}
            <div className="absolute bottom-4 right-4 h-1/4 w-1/4 max-h-48 max-w-xs rounded-lg border-2 border-primary overflow-hidden">
              <video
                ref={localVideoRef}
                className="h-full w-full object-cover"
                autoPlay
                playsInline
                muted
              />
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                {user?.nom} {!isAudioEnabled && '(Muet)'}
              </div>
            </div>
          </div>
        </div>
        
        {/* Chat panel */}
        {isChatOpen && (
          <div className="absolute right-0 top-16 bottom-0 w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
              <h2 className="text-lg font-semibold">Chat</h2>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageSquare className="mx-auto h-8 w-8 mb-2" />
                    <p>Aucun message</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map(msg => (
                    <div key={msg.id} className="bg-gray-700 p-3 rounded">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{msg.sender}</span>
                        <span className="text-xs text-gray-400">
                          {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="mt-1 text-gray-200">{msg.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-700 p-4">
              <form onSubmit={sendMessage} className="flex">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Écrire un message..."
                  className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-l focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="bg-primary px-4 py-2 rounded-r hover:bg-opacity-90"
                >
                  Envoyer
                </button>
              </form>
            </div>
          </div>
        )}
        
        {/* Participants panel */}
        {isParticipantsOpen && (
          <div className="absolute right-0 top-16 bottom-0 w-80 bg-gray-800 border-l border-gray-700">
            <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
              <h2 className="text-lg font-semibold">Participants ({participants.length})</h2>
              <button
                onClick={() => setIsParticipantsOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto h-full">
              <ul className="divide-y divide-gray-700">
                {participants.map(participant => (
                  <li key={participant.id} className="px-4 py-3">
                    <div className="flex items-center">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        participant.role === 'formateur' ? 'bg-blue-600' : 'bg-gray-600'
                      }`}>
                        {participant.name.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium">
                          {participant.name}
                          {participant.id === user?.id && ' (Vous)'}
                        </p>
                        <p className="text-xs text-gray-400 capitalize">
                          {participant.role === 'formateur' ? 'Formateur' : 'Étudiant'}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-center space-x-4 border-t border-gray-700 bg-gray-800 px-4 py-3">
        <button
          onClick={toggleAudio}
          className={`p-3 rounded-full ${isAudioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`}
          title={isAudioEnabled ? 'Muet' : 'Activer le micro'}
        >
          {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </button>
        
        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full ${isVideoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`}
          title={isVideoEnabled ? 'Désactiver la caméra' : 'Activer la caméra'}
        >
          {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </button>
        
        <button
          onClick={leaveClassroom}
          className="p-3 rounded-full bg-red-600 hover:bg-red-700"
          title="Quitter la classe"
        >
          <Phone className="h-5 w-5 transform rotate-135" />
        </button>
        
        <button
          onClick={() => {
            setIsChatOpen(true);
            setIsParticipantsOpen(false);
          }}
          className={`p-3 rounded-full ${isChatOpen ? 'bg-primary' : 'bg-gray-700 hover:bg-gray-600'}`}
          title="Chat"
        >
          <MessageSquare className="h-5 w-5" />
        </button>
        
        <button
          onClick={() => {
            setIsParticipantsOpen(true);
            setIsChatOpen(false);
          }}
          className={`p-3 rounded-full ${isParticipantsOpen ? 'bg-primary' : 'bg-gray-700 hover:bg-gray-600'}`}
          title="Participants"
        >
          <Users className="h-5 w-5" />
        </button>
        
        <button
          className="p-3 rounded-full bg-gray-700 hover:bg-gray-600"
          title="Partager l'écran"
        >
          <Share2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default VirtualClassroom;