import React, { useRef, useState } from 'react';
import { gradeSpeaking } from '../services/ai.service';
import LoadingSpinner from './LoadingSpinner';

const SpeakingGrader = () => {
    const [audioBlob, setAudioBlob] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [transcript, setTranscript] = useState('');
    const [engine, setEngine] = useState('whisper');
    const mediaRecorderRef = useRef(null);
    const [recording, setRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);

    // Ghi âm
    const startRecording = async () => {
        setError(null);
        setResult(null);
        setTranscript('');
        setAudioBlob(null);
        setAudioUrl(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new window.MediaRecorder(stream);
            let chunks = [];
            mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/wav' });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
            };
            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();
            setRecording(true);
        } catch (err) {
            setError(`Không thể truy cập micro: ${err.message}`);
            console.error(err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setRecording(false);
        }
    };

    // Upload file
    const handleFileChange = (e) => {
        setAudioBlob(e.target.files[0]);
        setAudioUrl(URL.createObjectURL(e.target.files[0]));
        setResult(null);
        setTranscript('');
        setError(null);
    };

    // Gửi lên API
    const handleSubmit = async () => {
        if (!audioBlob) return setError('Vui lòng ghi âm hoặc chọn file audio');
        setLoading(true);
        setError(null);
        setResult(null);
        setTranscript('');
        try {
            const res = await gradeSpeaking(audioBlob, engine);
            setResult(res);
            setTranscript(res.transcript);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6 mt-8">
            <h2 className="text-2xl font-bold mb-4">AI Chấm điểm Speaking</h2>
            <div className="mb-4 flex gap-2">
                <button
                    onClick={recording ? stopRecording : startRecording}
                    className={`px-4 py-2 rounded ${recording ? 'bg-red-600' : 'bg-blue-600'} text-white font-semibold`}
                >
                    {recording ? 'Dừng ghi âm' : 'Ghi âm'}
                </button>
                <input type="file" accept="audio/*" onChange={handleFileChange} className="ml-2" />
                <select value={engine} onChange={e => setEngine(e.target.value)} className="ml-2 border rounded p-2">
                    <option value="whisper">Whisper (OpenAI)</option>
                    <option value="google">Google Speech-to-Text</option>
                </select>
            </div>
            {audioUrl && (
                <audio controls src={audioUrl} className="mb-4 w-full" />
            )}
            <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded font-semibold mb-4"
                disabled={loading || !audioBlob}
            >
                Chấm điểm
            </button>
            {loading && <LoadingSpinner />}
            {error && <div className="text-red-600 mt-2">{error}</div>}
            {result && (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Kết quả AI chấm điểm:</h3>
                    <div className="mb-2"><b>Transcript:</b> <span className="text-blue-700">{transcript}</span></div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>Nội dung: <b>{result.contentScore}/10</b></div>
                        <div>Ngữ pháp: <b>{result.grammarScore}/10</b></div>
                        <div>Lưu loát: <b>{result.fluencyScore}/10</b></div>
                        <div>Tổng thể: <b>{result.overall}/10</b></div>
                    </div>
                    <div className="mt-2"><b>Feedback:</b> <span className="text-green-700">{result.feedback}</span></div>
                </div>
            )}
        </div>
    );
};

export default SpeakingGrader; 